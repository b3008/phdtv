import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Finding } from './findings.ts';
import { error } from './findings.ts';

/** GitHub logins whose pull requests are subject to the curator-ownership rule (automation.json). */
export function loadAutomationLogins(rootDir: string): Set<string> {
  try {
    const parsed = JSON.parse(readFileSync(join(rootDir, 'automation.json'), 'utf8')) as { automation?: string[] };
    return new Set(parsed.automation ?? []);
  } catch {
    return new Set();
  }
}

/** Content of a file at a git ref, or null when it did not exist there. */
export function fileAtRef(rootDir: string, ref: string, path: string): string | null {
  try {
    return execFileSync('git', ['show', `${ref}:${path}`], { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

const isEmpty = (value: unknown): boolean =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

const canonical = (value: unknown): string => JSON.stringify(value instanceof Date ? value.toISOString() : value);

/**
 * Fields that were non-empty in a verified base record may not be changed by automation.
 * The `source` block is always the writer's own to update.
 */
export function ownershipFindings(
  path: string,
  head: Record<string, unknown>,
  base: Record<string, unknown>,
  author: string,
): Finding[] {
  if (isEmpty(base['verified_by'])) return [];
  const findings: Finding[] = [];
  for (const [key, baseValue] of Object.entries(base)) {
    if (key === 'source' || isEmpty(baseValue)) continue;
    if (canonical(baseValue) !== canonical(head[key])) {
      findings.push(error(path, 'ownership', `automation "${author}" changed protected field "${key}" of a verified record`));
    }
  }
  return findings;
}
