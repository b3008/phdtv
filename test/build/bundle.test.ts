import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The one test that runs the real build, Vite bundling included. What the output contains is covered
// in-process by site.test.ts; this checks that the pieces fit together on disk.
describe('node scripts/build.ts', () => {
  it('writes a site whose pages reference assets that exist, and ships no manifest', () => {
    const out = mkdtempSync(join(tmpdir(), 'phdtv-dist-'));
    // Vitest sets NODE_ENV=test and mirrors import.meta.env into process.env; a child Vite build must not inherit
    // those or it bundles React's development build.
    const env: NodeJS.ProcessEnv = { ...process.env, SITE_URL: 'https://example.test', SITE_BASE: '/phdtv' };
    for (const key of ['NODE_ENV', 'VITEST', 'MODE', 'BASE_URL', 'DEV', 'PROD', 'SSR']) delete env[key];
    execFileSync(process.execPath, ['scripts/build.ts', '--out', out], { stdio: ['ignore', 'pipe', 'pipe'], env, timeout: 180_000 });

    const centerfold = 'centerfold/2026/2026-09-07-kth-anders-enqvist/index.html';
    for (const file of ['index.html', 'archive/index.html', centerfold, 'feeds/all.ics', 'feeds/law.ics', 'api/defenses.json']) {
      expect(existsSync(join(out, file)), file).toBe(true);
    }
    for (const page of ['index.html', centerfold]) {
      const html = readFileSync(join(out, page), 'utf8');
      const refs = [...html.matchAll(/(?:src|href)="\/phdtv\/(assets\/[^"]+)"/g)].map((m) => m[1] ?? '');
      expect(refs.filter((r) => r.endsWith('.css')).length, page).toBeGreaterThanOrEqual(page === centerfold ? 2 : 1);
      expect(refs.some((r) => r.endsWith('.js')), page).toBe(true);
      for (const ref of refs) expect(existsSync(join(out, ref)), ref).toBe(true);
    }
    expect(existsSync(join(out, '.vite'))).toBe(false);
  }, 200_000);
});
