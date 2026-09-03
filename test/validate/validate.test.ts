import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadDisciplines } from '../../src/schema/disciplines.ts';
import { formatFinding, hasBlockingFindings, validateProject } from '../../src/validate/index.ts';

const disciplines = loadDisciplines().slugs;
const fixture = (name: string) => resolve('test/fixtures', name);

describe('validateProject: schema rules', () => {
  it('reports one line per finding, naming file, rule and field', async () => {
    const findings = await validateProject({ rootDir: fixture('schema-project'), disciplines, checkLinks: false });
    expect(findings.map(formatFinding).sort()).toMatchSnapshot();
  });

  it('treats schema findings as blocking', async () => {
    const findings = await validateProject({ rootDir: fixture('schema-project'), disciplines, checkLinks: false });
    expect(hasBlockingFindings(findings)).toBe(true);
  });

  it('passes a valid record without findings', async () => {
    const findings = await validateProject({ rootDir: fixture('schema-project'), disciplines, checkLinks: false });
    expect(findings.filter((f) => f.path.includes('jane-doe'))).toEqual([]);
  });
});

describe('scripts/validate.ts', () => {
  it('exits non-zero and prints findings for the broken fixture project', () => {
    let stdout = '';
    let status = 0;
    try {
      stdout = execFileSync('node', ['scripts/validate.ts', '--root', fixture('schema-project'), '--no-links'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (error) {
      const failure = error as { status: number; stdout: string };
      status = failure.status;
      stdout = failure.stdout;
    }
    expect(status).toBe(1);
    expect(stdout).toMatch(/records\/2026\/2026-09-16-tudelft-no-title\.md: schema: title/);
    expect(stdout).toMatch(/universities\/broken\.yaml: schema: timezone/);
  });
});
