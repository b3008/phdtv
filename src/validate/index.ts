import { loadRecordFiles, loadUniversityFiles } from '../lib/records.ts';
import { loadDisciplines } from '../schema/disciplines.ts';
import { createRecordSchema } from '../schema/record.ts';
import { universitySchema } from '../schema/university.ts';
import type { Finding } from './findings.ts';
import { error } from './findings.ts';
import { schemaFindings } from './schema-rules.ts';
import { recordPathFinding, registryFinding, timezoneFinding, universityPathFinding } from './cross-rules.ts';
import type { University } from '../schema/university.ts';
import type { DefenseRecord } from '../schema/record.ts';
import { basename } from 'node:path';
import { parseRecordFile } from '../lib/records.ts';
import { fileAtRef, loadAutomationLogins, ownershipFindings } from './ownership.ts';
import { checkLink, isOnline, type LinkCheckOptions } from './links.ts';
import { warning } from './findings.ts';

export type { Finding, FindingLevel } from './findings.ts';
export { formatFinding, hasBlockingFindings } from './findings.ts';

export interface ValidateOptions {
  /** Project root containing records/, universities/ and disciplines.yaml. */
  rootDir: string;
  /** Discipline slugs; defaults to the vocabulary in the current working directory. */
  disciplines?: Set<string>;
  /** Check that stream and recording URLs respond. Defaults to true. */
  checkLinks?: boolean;
  /** Git ref of the pull request base; enables the curator-ownership rule together with `author`. */
  base?: string;
  /** GitHub login of the pull request author. */
  author?: string;
  /** Overrides for the link checker (tests inject a fake fetch). */
  links?: LinkCheckOptions;
}

/** Run every rule over the project and return findings in file order. */
export async function validateProject(options: ValidateOptions): Promise<Finding[]> {
  const disciplines = options.disciplines ?? loadDisciplines().slugs;
  const recordSchema = createRecordSchema(disciplines);
  const findings: Finding[] = [];
  const automation = loadAutomationLogins(options.rootDir);
  const links: Array<{ path: string; field: string; url: string }> = [];

  const registrySlugs = new Set<string>();
  const universities = new Map<string, University>();
  for (const file of loadUniversityFiles(options.rootDir)) {
    registrySlugs.add(basename(file.path).replace(/\.ya?ml$/, ''));
    if (file.error) {
      findings.push(error(file.path, 'schema', file.error));
      continue;
    }
    const parsed = universitySchema.safeParse(file.data);
    if (!parsed.success) {
      findings.push(...schemaFindings(file.path, universitySchema, file.data));
      continue;
    }
    findings.push(...universityPathFinding(file.path, parsed.data));
    universities.set(parsed.data.slug, parsed.data);
  }

  for (const file of loadRecordFiles(options.rootDir)) {
    if (file.error) {
      findings.push(error(file.path, 'schema', file.error));
      continue;
    }
    if (options.base && options.author && automation.has(options.author)) {
      const baseText = fileAtRef(options.rootDir, options.base, file.path);
      const baseData = baseText === null ? undefined : parseRecordFile(baseText).data;
      if (isRecordObject(baseData) && isRecordObject(file.data)) {
        findings.push(...ownershipFindings(file.path, file.data, baseData, options.author));
      }
    }
    const parsed = recordSchema.safeParse(file.data);
    if (!parsed.success) {
      findings.push(...schemaFindings(file.path, recordSchema, file.data));
      continue;
    }
    const record: DefenseRecord = parsed.data;
    if (record.stream) links.push({ path: file.path, field: 'stream.url', url: record.stream.url });
    if (record.recording && 'url' in record.recording) {
      links.push({ path: file.path, field: 'recording.url', url: record.recording.url });
    }
    findings.push(...recordPathFinding(file.path, record));
    findings.push(...registryFinding(file.path, record, registrySlugs));
    findings.push(...timezoneFinding(file.path, record, universities.get(record.university)));
  }

  if (options.checkLinks !== false && (await (options.links?.online ?? isOnline)())) {
    const outcomes = await Promise.all(links.map((link) => checkLink(link.url, options.links ?? {})));
    outcomes.forEach((outcome, i) => {
      const link = links[i];
      if (link && !outcome.reachable) {
        findings.push(warning(link.path, 'link', `${link.field} ${link.url} did not respond (${outcome.detail})`));
      }
    });
  }

  return findings;
}

const isRecordObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
