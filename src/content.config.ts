import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const records = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './records' }),
  schema: z.object({ candidate: z.string() }).passthrough(),
});

export const collections = { records };
