import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let built: string | null = null;

/** Build the site once per test run into a scratch directory and return its path. */
export function buildSite(): string {
  if (built && existsSync(built)) return built;
  const outDir = mkdtempSync(join(tmpdir(), 'phdtv-dist-'));
  // Vitest mirrors import.meta.env into process.env (BASE_URL, MODE, DEV, PROD, SSR); a child Astro build
  // must not inherit those or its own import.meta.env.BASE_URL is overridden.
  const env = { ...process.env, SITE_URL: 'https://example.test', SITE_BASE: '/phdtv' };
  for (const key of ['BASE_URL', 'MODE', 'DEV', 'PROD', 'SSR', 'VITEST', 'NODE_ENV']) delete env[key];
  execFileSync('npx', ['astro', 'build', '--outDir', outDir], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
    timeout: 180_000,
  });
  built = outDir;
  return outDir;
}
