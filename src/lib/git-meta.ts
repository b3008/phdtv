import { execFileSync } from 'node:child_process';

export interface FileHistory {
  /** Number of commits that touched the file; used as the feed SEQUENCE. */
  commits: number;
  /** Committer date of the most recent commit touching the file. */
  lastCommitAt: Date;
}

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
}

/** Commit count and latest commit date for every file under `prefix`, from a single `git log`. */
export function readFileHistories(rootDir: string, prefix = 'records/'): Map<string, FileHistory> {
  if (git(rootDir, 'rev-parse', '--is-shallow-repository').trim() === 'true') {
    throw new Error(
      'The repository is a shallow checkout, so per-file commit counts would be wrong. Clone with full history (fetch-depth: 0).',
    );
  }
  let log: string;
  try {
    log = git(rootDir, 'log', '--format=%x01%cI', '--name-only', '--', prefix);
  } catch (cause) {
    if (/does not have any commits yet/.test((cause as Error).message)) return new Map();
    throw cause;
  }
  const histories = new Map<string, FileHistory>();
  for (const chunk of log.split('\u0001')) {
    const [dateLine, ...rest] = chunk.split('\n');
    if (!dateLine?.trim()) continue;
    const committedAt = new Date(dateLine.trim());
    for (const path of rest.map((l) => l.trim()).filter(Boolean)) {
      const existing = histories.get(path);
      if (existing) existing.commits += 1;
      else histories.set(path, { commits: 1, lastCommitAt: committedAt });
    }
  }
  return histories;
}
