// Build once, serve dist/ at the site base, rebuild when source or data changes. Refresh the browser to see it.
import { watch } from 'node:fs';
import { resolve } from 'node:path';
import { preview } from 'vite';
import { buildSite, normalizeBase } from '../src/site/build.ts';

const rootDir = process.cwd();
const outDir = resolve('dist');
const base = process.env['SITE_BASE'] ?? '/';
const port = Number(process.env['PORT'] ?? 4321);
const site = process.env['SITE_URL'] ?? `http://localhost:${port}`;

let chain = Promise.resolve();
function rebuild(): Promise<void> {
  chain = chain.then(async () => {
    const started = Date.now();
    try {
      const files = await buildSite({ rootDir, outDir, site, base });
      console.log(`[${new Date().toLocaleTimeString()}] built ${files.length} files in ${Date.now() - started} ms`);
    } catch (cause) {
      console.error(cause instanceof Error ? cause.message : cause);
    }
  });
  return chain;
}

await rebuild();
await preview({
  root: rootDir,
  configFile: false,
  logLevel: 'warn',
  base: normalizeBase(base),
  build: { outDir },
  preview: { port, strictPort: true, open: false },
});
// Printed here rather than through Vite's logger, which the warn level above keeps quiet.
console.log(`Serving ${outDir} at http://localhost:${port}${normalizeBase(base)}`);

let timer: NodeJS.Timeout | undefined;
const schedule = () => {
  clearTimeout(timer);
  timer = setTimeout(() => void rebuild(), 200);
};
for (const path of ['src', 'records', 'universities']) watch(path, { recursive: true }, schedule);
watch('disciplines.yaml', schedule);
console.log('Watching src/, records/, universities/ and disciplines.yaml. Press Ctrl+C to stop.');
