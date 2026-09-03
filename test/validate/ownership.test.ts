import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { loadDisciplines } from '../../src/schema/disciplines.ts';
import { formatFinding, hasBlockingFindings, validateProject } from '../../src/validate/index.ts';

const disciplines = loadDisciplines().slugs;
const RECORD = 'records/2026/2026-09-15-tudelft-jane-doe.md';

function record(fields: { title: string; stream?: string }): string {
  const stream = fields.stream ? `stream:\n  url: ${fields.stream}\n  platform: youtube\n` : '';
  return `---
candidate: Jane Doe
title: ${fields.title}
university: tudelft
starts_at: "2026-09-15T12:30:00+02:00"
timezone: Europe/Amsterdam
${stream}status: published
source:
  channel: curated
verified_by: amv
---
`;
}

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

let repo: string;

beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), 'phdtv-owner-'));
  mkdirSync(join(repo, 'records/2026'), { recursive: true });
  mkdirSync(join(repo, 'universities'));
  writeFileSync(
    join(repo, 'universities/tudelft.yaml'),
    'slug: tudelft\nname: Delft University of Technology\ncountry: NL\ntimezone: Europe/Amsterdam\n',
  );
  writeFileSync(join(repo, 'automation.json'), JSON.stringify({ automation: ['phdtv-bot'] }));
  writeFileSync(join(repo, RECORD), record({ title: 'Original title' }));
  git(repo, 'init', '-q', '-b', 'main');
  git(repo, '-c', 'user.name=t', '-c', 'user.email=t@example.com', 'add', '-A');
  git(repo, '-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-q', '-m', 'base');
});

const run = (author: string) => validateProject({ rootDir: repo, disciplines, checkLinks: false, base: 'HEAD', author });

describe('curator ownership rule', () => {
  it('blocks automation that changes a protected field of a verified record', async () => {
    writeFileSync(join(repo, RECORD), record({ title: 'Rewritten by a bot' }));
    const findings = await run('phdtv-bot');
    expect(findings.map(formatFinding)).toEqual([
      `${RECORD}: ownership: automation "phdtv-bot" changed protected field "title" of a verified record`,
    ]);
    expect(hasBlockingFindings(findings)).toBe(true);
  });

  it('allows automation to fill a field that was empty', async () => {
    writeFileSync(join(repo, RECORD), record({ title: 'Original title', stream: 'https://www.youtube.com/watch?v=x' }));
    expect(await run('phdtv-bot')).toEqual([]);
  });

  it('allows a human author to change a protected field', async () => {
    writeFileSync(join(repo, RECORD), record({ title: 'Corrected by the curator' }));
    expect(await run('amv')).toEqual([]);
  });

  it('ignores records that did not exist in the base commit', async () => {
    const added = 'records/2026/2026-09-16-tudelft-new-person.md';
    writeFileSync(join(repo, added), record({ title: 'Brand new' }).replace('Jane Doe', 'New Person').replace('09-15', '09-16'));
    expect((await run('phdtv-bot')).filter((f) => f.rule === 'ownership')).toEqual([]);
  });
});
