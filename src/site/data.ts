// The site's data layer: the same loaders and schemas the validator uses, so the build sees what the validator saw.
import { basename } from 'node:path';
import type { ZodError } from 'zod';
import { toDefense, type Defense } from '../lib/defense.ts';
import { loadRecordFiles, loadUniversityFiles } from '../lib/records.ts';
import { loadDisciplines } from '../schema/disciplines.ts';
import { createRecordSchema } from '../schema/record.ts';
import { universitySchema, type University } from '../schema/university.ts';

export interface SiteData {
  /** Published defenses, soonest first. */
  defenses: Defense[];
  /** Every minor-field slug of the vocabulary, in file order. */
  disciplineSlugs: string[];
}

function fail(where: string, issue: string): never {
  throw new Error(`${where}: ${issue}`);
}

function firstIssue(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'does not match the schema';
  const path = issue.path.map(String).join('.');
  return path ? `${path}: ${issue.message}` : issue.message;
}

/**
 * Read records, universities and disciplines under `rootDir`. Throws on the first invalid file or dangling
 * university reference, naming it, so a bad merge fails the build instead of producing a partial site.
 */
export function loadSiteData(rootDir: string, base: string): SiteData {
  const disciplines = loadDisciplines(rootDir);
  const recordSchema = createRecordSchema(disciplines.slugs);
  const disciplineNames = Object.fromEntries(disciplines.minors.map((m) => [m.slug, m.name]));

  const universities = new Map<string, University>();
  for (const file of loadUniversityFiles(rootDir)) {
    if (file.error) fail(file.path, file.error);
    const parsed = universitySchema.safeParse(file.data);
    if (!parsed.success) fail(file.path, firstIssue(parsed.error));
    universities.set(basename(file.path).replace(/\.ya?ml$/, ''), parsed.data);
  }

  const defenses: Defense[] = [];
  for (const file of loadRecordFiles(rootDir)) {
    if (file.error) fail(file.path, file.error);
    const parsed = recordSchema.safeParse(file.data);
    if (!parsed.success) fail(file.path, firstIssue(parsed.error));
    if (parsed.data.status !== 'published') continue;
    const id = file.path.replace(/^records\//, '').replace(/\.md$/, '');
    const university = universities.get(parsed.data.university);
    if (!university) fail(id, `university "${parsed.data.university}" is not in the registry`);
    defenses.push(toDefense({ id, body: file.body, record: parsed.data, university, disciplineNames, base }));
  }
  defenses.sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return { defenses, disciplineSlugs: disciplines.minors.map((m) => m.slug) };
}
