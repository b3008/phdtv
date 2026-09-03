import { basename } from 'node:path';
import { slugify } from '../lib/slug.ts';
import { localDateString } from '../lib/time.ts';
import type { DefenseRecord } from '../schema/record.ts';
import type { University } from '../schema/university.ts';
import type { Finding } from './findings.ts';
import { error, warning } from './findings.ts';

/** Canonical path of a record: records/<year>/<local date>-<university>-<candidate slug>.md */
export function expectedRecordPath(record: Pick<DefenseRecord, 'candidate' | 'university' | 'starts_at' | 'timezone'>) {
  const date = localDateString(record.timezone, new Date(record.starts_at));
  return `records/${date.slice(0, 4)}/${date}-${record.university}-${slugify(record.candidate)}.md`;
}

export function recordPathFinding(path: string, record: DefenseRecord): Finding[] {
  const expected = expectedRecordPath(record);
  return path === expected ? [] : [error(path, 'path', `expected ${expected}`)];
}

export function universityPathFinding(path: string, university: University): Finding[] {
  const fileSlug = basename(path).replace(/\.ya?ml$/, '');
  return fileSlug === university.slug
    ? []
    : [error(path, 'path', `slug "${university.slug}" does not match the file name "${fileSlug}"`)];
}

export function registryFinding(path: string, record: DefenseRecord, registrySlugs: Set<string>): Finding[] {
  return registrySlugs.has(record.university)
    ? []
    : [error(path, 'registry', `university "${record.university}" has no file under universities/`)];
}

export function timezoneFinding(path: string, record: DefenseRecord, university: University | undefined): Finding[] {
  if (!university || university.timezone === record.timezone) return [];
  return [
    warning(
      path,
      'timezone',
      `record uses ${record.timezone} but ${university.slug} is registered in ${university.timezone}`,
    ),
  ];
}
