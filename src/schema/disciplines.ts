import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'js-yaml';
import { z } from 'zod';

const majorSchema = z.object({ slug: z.string(), code: z.string(), name: z.string() }).strict();
const minorSchema = majorSchema.extend({ major: z.string() }).strict();
const fileSchema = z.object({ majors: z.array(majorSchema), minors: z.array(minorSchema) }).strict();

export type MajorField = z.infer<typeof majorSchema>;
export type MinorField = z.infer<typeof minorSchema>;

export interface Disciplines {
  majors: MajorField[];
  minors: MinorField[];
  /** Minor-field slugs, the only values allowed in a record's `disciplines`. */
  slugs: Set<string>;
}

/** Load `disciplines.yaml` from the project root (or `rootDir`). */
export function loadDisciplines(rootDir: string = process.cwd()): Disciplines {
  const raw = load(readFileSync(resolve(rootDir, 'disciplines.yaml'), 'utf8')) as unknown;
  const { majors, minors } = fileSchema.parse(raw);
  return { majors, minors, slugs: new Set(minors.map((m) => m.slug)) };
}
