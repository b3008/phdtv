import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadDisciplines } from '../../src/schema/disciplines.ts';
import { formatFinding, hasBlockingFindings, validateProject } from '../../src/validate/index.ts';

const disciplines = loadDisciplines().slugs;
const run = (name: string) => validateProject({ rootDir: resolve('test/fixtures', name), disciplines, checkLinks: false });

describe('validateProject: cross-file rules', () => {
  it('requires the file name to match date, university and candidate slug', async () => {
    const lines = (await run('cross-project')).map(formatFinding);
    expect(lines).toContain(
      'records/2026/2026-09-15-tudelft-wrong-name.md: path: expected records/2026/2026-09-15-tudelft-jane-doe.md',
    );
  });

  it('derives the file date from the local date in the record time zone', async () => {
    const lines = (await run('cross-project')).map(formatFinding);
    expect(lines).toContain(
      'records/2026/2026-09-15-tudelft-utc-writer.md: path: expected records/2026/2026-09-16-tudelft-utc-writer.md',
    );
  });

  it('accepts a file name built from a candidate with diacritics', async () => {
    const findings = await run('cross-project');
    expect(findings.filter((f) => f.path.includes('jose-niguez'))).toEqual([]);
  });

  it('requires the university slug to exist in the registry', async () => {
    const lines = (await run('cross-project')).map(formatFinding);
    expect(lines).toContain(
      'records/2026/2026-09-17-unknown-uni-some-one.md: registry: university "unknown-uni" has no file under universities/',
    );
  });

  it('requires a registry file name to match its slug', async () => {
    const lines = (await run('cross-project')).map(formatFinding);
    expect(lines).toContain('universities/mismatch.yaml: path: slug "other" does not match the file name "mismatch"');
  });

  it('warns when a record time zone differs from the registry time zone', async () => {
    const lines = (await run('cross-project')).map(formatFinding);
    expect(lines).toContain(
      'records/2026/2026-09-18-tudelft-zone-drift.md: timezone: [warning] record uses Europe/London but tudelft is registered in Europe/Amsterdam',
    );
  });

  it('does not block on the time zone warning alone', async () => {
    const findings = await run('warning-only-project');
    expect(findings.map((f) => f.level)).toEqual(['warning']);
    expect(hasBlockingFindings(findings)).toBe(false);
  });

  it('leaves a correct record without findings', async () => {
    const findings = await run('cross-project');
    expect(findings.filter((f) => f.path.endsWith('2026-09-15-tudelft-jane-doe.md'))).toEqual([]);
  });
});
