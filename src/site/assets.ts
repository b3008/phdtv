// Plain TypeScript, no JSX: imported both by the Node build orchestrator and by the server-rendered Document.
import { withBase } from '../lib/paths.ts';

/** Client entry per hydrated component, keyed by island name. Paths are relative to the project root. */
export const ISLAND_ENTRIES = {
  DefenseCalendar: 'src/site/client/calendar.tsx',
  DefensePage: 'src/site/client/defense.tsx',
} as const;
export type IslandName = keyof typeof ISLAND_ENTRIES;

export const STYLE_ENTRY = 'src/styles/global.css';

/** The part of Vite's build manifest (dist/.vite/manifest.json) that page assembly needs, keyed by source path. */
export type AssetManifest = Record<string, { file: string; css?: string[]; imports?: string[] }>;

export interface PageAssets {
  /** Stylesheet hrefs, base-prefixed. */
  styles: string[];
  /** Module script srcs for the islands on the page, base-prefixed. */
  scripts: string[];
  /** Shared chunks the island scripts import, for modulepreload. */
  preloads: string[];
}

function chunk(manifest: AssetManifest, key: string) {
  const found = manifest[key];
  if (!found) throw new Error(`asset manifest has no entry for ${key}`);
  return found;
}

/** Resolve the stylesheet and the scripts for the islands on a page from the manifest. */
export function pageAssets(manifest: AssetManifest, base: string, islands: IslandName[]): PageAssets {
  const href = (file: string) => withBase(base, `/${file}`);
  const styles = new Set([href(chunk(manifest, STYLE_ENTRY).file)]);
  const scripts: string[] = [];
  const preloads = new Set<string>();
  for (const name of islands) {
    const entry = chunk(manifest, ISLAND_ENTRIES[name]);
    scripts.push(href(entry.file));
    for (const css of entry.css ?? []) styles.add(href(css));
    for (const key of entry.imports ?? []) preloads.add(href(chunk(manifest, key).file));
  }
  return { styles: [...styles], scripts, preloads: [...preloads] };
}
