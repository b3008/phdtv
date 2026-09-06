// Plain TypeScript run by Node directly: it must not import anything that contains JSX.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { ISLAND_ENTRIES, STYLE_ENTRY, type AssetManifest } from './assets.ts';

export interface BuildOptions {
  rootDir: string;
  outDir: string;
  /** Site origin for absolute URLs, e.g. https://b3008.github.io. */
  site: string;
  /** Base path, with or without slashes, e.g. /phdtv. */
  base: string;
  /** Preview builds show slots for empty editorial fields on centerfold pages. */
  preview?: boolean;
}

const GENERATOR_ENTRY = 'src/site/generate.ts';

/** Vite's form of a base path: leading and trailing slash, or just "/". */
export function normalizeBase(base: string): string {
  const trimmed = base.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

/** Bundle the browser assets, then render every page, feed and export into `outDir`. Returns the written paths. */
export async function buildSite({ rootDir, outDir, site, base, preview = false }: BuildOptions): Promise<string[]> {
  const root = resolve(rootDir);
  const out = resolve(outDir);
  const normalizedBase = normalizeBase(base);

  await build({
    root,
    configFile: false,
    logLevel: 'warn',
    base: normalizedBase,
    build: { outDir: out, emptyOutDir: true, manifest: true, rolldownOptions: { input: { ...ISLAND_ENTRIES, style: STYLE_ENTRY } } },
  });
  const manifest = JSON.parse(readFileSync(join(out, '.vite/manifest.json'), 'utf8')) as AssetManifest;

  // Node strips types but not JSX, so the generator is bundled for the server first and then imported. The bundle
  // stays inside the project so its react-dom and js-yaml imports resolve; the query defeats the module cache so
  // the dev loop sees fresh code after a rebuild.
  const serverDir = join(root, 'node_modules/.phdtv/site');
  await build({ root, configFile: false, logLevel: 'warn', build: { ssr: GENERATOR_ENTRY, outDir: serverDir, emptyOutDir: true } });
  const url = `${pathToFileURL(join(serverDir, 'generate.js')).href}?t=${Date.now()}`;
  const generator = (await import(url)) as typeof import('./generate.ts');

  const files = generator.generate({ rootDir: root, site, base: normalizedBase, manifest, preview });
  for (const file of files) {
    const target = join(out, file.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.body);
  }
  rmSync(join(out, '.vite'), { recursive: true, force: true });
  return files.map((f) => f.path);
}
