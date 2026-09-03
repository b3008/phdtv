import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { load } from 'js-yaml';
import { z } from 'zod';
import { recordSchema } from './schema/record.ts';
import { universitySchema } from './schema/university.ts';

// The dataset lives at the repository root, outside src/, so it reads as data rather than as site code.

const records = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './records', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: recordSchema,
});

const universities = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './universities', generateId: ({ entry }) => entry.replace(/\.ya?ml$/, '') }),
  schema: universitySchema,
});

const disciplines = defineCollection({
  loader: file('./disciplines.yaml', {
    parser: (text) => {
      const parsed = load(text) as { minors: Array<{ slug: string; code: string; name: string; major: string }> };
      return parsed.minors.map((minor) => ({ id: minor.slug, ...minor }));
    },
  }),
  schema: z.object({ slug: z.string(), code: z.string(), name: z.string(), major: z.string() }),
});

export const collections = { records, universities, disciplines };
