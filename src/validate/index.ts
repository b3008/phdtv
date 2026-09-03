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

export type { Finding, FindingLevel } from './findings.ts';
export { formatFinding, hasBlockingFindings } from './findings.ts';

export interface ValidateOptions {
  /** Project root containing records/, universities/ and disciplines.yaml. */
  rootDir: string;
  /** Discipline slugs; defaults to the vocabulary in the current working directory. */
  disciplines?: Set<string>;
  /** Check that stream and recording URLs respond. Defaults to true. */
  checkLinks?: boolean;
}

/** Run every rule over the project and return findings in file order. */
export async function validateProject(options: ValidateOptions): Promise<Finding[]> {
  const disciplines = options.disciplines ?? loadDisciplines().slugs;
  const recordSchema = createRecordSchema(disciplines);
  const findings: Finding[] = [];

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
    const parsed = recordSchema.safeParse(file.data);
    if (!parsed.success) {
      findings.push(...schemaFindings(file.path, recordSchema, file.data));
      continue;
    }
    const record: DefenseRecord = parsed.data;
    findings.push(...recordPathFinding(file.path, record));
    findings.push(...registryFinding(file.path, record, registrySlugs));
    findings.push(...timezoneFinding(file.path, record, universities.get(record.university)));
  }

  return findings;
}
