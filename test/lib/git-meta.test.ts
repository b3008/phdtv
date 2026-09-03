import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readFileHistories } from '../../src/lib/git-meta.ts';

const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

function repoWithRecord(): { dir: string; file: string } {
  const dir = mkdtempSync(join(tmpdir(), 'phdtv-git-'));
  mkdirSync(join(dir, 'records/2026'), { recursive: true });
  const file = 'records/2026/2026-09-15-tudelft-jane-doe.md';
  writeFileSync(join(dir, file), '---\ncandidate: Jane Doe\n---\n');
  writeFileSync(join(dir, 'README.md'), 'not a record\n');
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', 'first');
  return { dir, file };
}

describe('readFileHistories', () => {
  it('counts commits per record file and reports the latest commit date', () => {
    const { dir, file } = repoWithRecord();
    const first = readFileHistories(dir).get(file);
    expect(first?.commits).toBe(1);
    expect(first?.lastCommitAt).toBeInstanceOf(Date);

    writeFileSync(join(dir, file), '---\ncandidate: Jane Doe\ntitle: Added later\n---\n');
    git(dir, 'commit', '-q', '-am', 'second', '--date', '2030-01-01T00:00:00Z');
    const second = readFileHistories(dir).get(file);
    expect(second?.commits).toBe(2);
    expect(second!.lastCommitAt.getTime()).toBeGreaterThanOrEqual(first!.lastCommitAt.getTime());
  });

  it('only reports files under records/', () => {
    const { dir } = repoWithRecord();
    expect(readFileHistories(dir).has('README.md')).toBe(false);
  });

  it('throws on a shallow checkout instead of under-counting', () => {
    const { dir } = repoWithRecord();
    const shallow = mkdtempSync(join(tmpdir(), 'phdtv-shallow-'));
    execFileSync('git', ['clone', '-q', '--depth', '1', `file://${dir}`, join(shallow, 'clone')], { stdio: 'ignore' });
    expect(() => readFileHistories(join(shallow, 'clone'))).toThrow(/shallow/i);
  });
});
