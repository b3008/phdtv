import { z } from 'zod';
import { recordSchema } from './record.ts';
import { universitySchema } from './university.ts';

export type JsonSchema = Record<string, unknown>;

/** JSON Schema (draft-07) documents generated from the Zod schemas, for editors and non-TypeScript consumers. */
export function buildJsonSchemas(): { record: JsonSchema; university: JsonSchema } {
  const record = z.toJSONSchema(recordSchema, { target: 'draft-7', io: 'input', unrepresentable: 'any' }) as JsonSchema;
  const university = z.toJSONSchema(universitySchema, { target: 'draft-7', io: 'input' }) as JsonSchema;
  return {
    record: {
      ...record,
      title: 'PhD TV defense record',
      description:
        'Frontmatter of one defense file under records/. Generated from src/schema/record.ts; do not edit by hand.',
    },
    university: {
      ...university,
      title: 'PhD TV university registry entry',
      description: 'One file under universities/. Generated from src/schema/university.ts; do not edit by hand.',
    },
  };
}

/** File name to file content, as committed under schema/. */
export function renderJsonSchemas(): Record<string, string> {
  const { record, university } = buildJsonSchemas();
  return {
    'record.schema.json': `${JSON.stringify(record, null, 2)}\n`,
    'university.schema.json': `${JSON.stringify(university, null, 2)}\n`,
  };
}
