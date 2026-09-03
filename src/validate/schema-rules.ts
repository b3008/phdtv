import type { z } from 'zod';
import type { Finding } from './findings.ts';
import { error } from './findings.ts';

/** Turn a Zod issue into a human line that names the field first. */
export function describeIssue(issue: z.core.$ZodIssue): string {
  if (issue.code === 'unrecognized_keys') return `unknown field "${issue.keys.join('", "')}"`;
  const field = issue.path.map(String).join('.') || '(root)';
  if (issue.code === 'invalid_type' && issue.input === undefined) return `${field} is required`;
  if (issue.code === 'invalid_union') return `${field} must be either a link (url and platform) or { status: none }`;
  return `${field} ${issue.message}`;
}

export function schemaFindings(path: string, schema: z.ZodType, data: unknown): Finding[] {
  const result = schema.safeParse(data, { reportInput: true });
  if (result.success) return [];
  return result.error.issues.map((issue) => error(path, 'schema', describeIssue(issue)));
}
