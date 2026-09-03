export type FindingLevel = 'error' | 'warning';

export interface Finding {
  /** File the finding is about, relative to the project root. */
  path: string;
  rule: 'schema' | 'path' | 'registry' | 'timezone' | 'ownership' | 'link';
  message: string;
  level: FindingLevel;
}

export const error = (path: string, rule: Finding['rule'], message: string): Finding => ({
  path,
  rule,
  message,
  level: 'error',
});

export const warning = (path: string, rule: Finding['rule'], message: string): Finding => ({
  path,
  rule,
  message,
  level: 'warning',
});

/** One line per finding: `path: rule: message`, with warnings marked. */
export function formatFinding(f: Finding): string {
  return f.level === 'warning' ? `${f.path}: ${f.rule}: [warning] ${f.message}` : `${f.path}: ${f.rule}: ${f.message}`;
}

export function hasBlockingFindings(findings: Finding[]): boolean {
  return findings.some((f) => f.level === 'error');
}
