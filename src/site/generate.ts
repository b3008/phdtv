// Everything the site consists of apart from the bundled assets, as an in-memory list. Pure apart from reading
// the repository and its git history; the orchestrator in build.ts writes the result to disk.
import { headlines } from '../components/HeadlineStrip.tsx';
import type { Defense } from '../lib/defense.ts';
import { feedEvents } from '../lib/feed.ts';
import { readFileHistories } from '../lib/git-meta.ts';
import { renderCalendar } from '../lib/ics.ts';
import type { AssetManifest } from './assets.ts';
import { loadSiteData } from './data.ts';
import { archiveRedirectPage, centerfoldPage, defensePage, homePage } from './pages.tsx';

export const SCHEMA_VERSION = 1;

export interface GenerateOptions {
  /** Project root containing records/, universities/ and disciplines.yaml. */
  rootDir: string;
  /** Site origin, e.g. https://b3008.github.io, for absolute URLs in the feeds and the export. */
  site: string;
  /** Base path of the site with surrounding slashes, e.g. /phdtv/. */
  base: string;
  manifest: AssetManifest;
  /** Build time; defaults to the current time. */
  now?: Date;
  /** Preview builds (the dev server) show slots for empty editorial fields; the deploy hides them. */
  preview?: boolean;
}

export interface OutputFile {
  /** Path relative to the output directory, with forward slashes. */
  path: string;
  body: string;
}

export function generate({ rootDir, site, base, manifest, now = new Date(), preview = false }: GenerateOptions): OutputFile[] {
  const { defenses, disciplineSlugs, majors } = loadSiteData(rootDir, base);
  const histories = readFileHistories(rootDir);
  const renderedAt = now.toISOString();
  // The strip describes the whole listing at build time; the calendar island recomputes it from the viewer's clock.
  const context = { base, manifest, renderedAt, preview, headlines: headlines(defenses, now, null) };
  const files: OutputFile[] = [];

  files.push({ path: 'index.html', body: homePage({ defenses, majors }, context) });
  files.push({ path: 'archive/index.html', body: archiveRedirectPage(context) });
  for (const defense of defenses) {
    files.push({ path: `defenses/${defense.key}/index.html`, body: defensePage(defense, context) });
    if (defense.centerfold) files.push({ path: `centerfold/${defense.key}/index.html`, body: centerfoldPage(defense, context) });
  }

  const calendar = (name: string, keep: (d: Defense) => boolean) =>
    renderCalendar(feedEvents(defenses.filter(keep), { histories, now, site }), { name });
  files.push({ path: 'feeds/all.ics', body: calendar('PhD TV: all defenses', () => true) });
  for (const slug of disciplineSlugs) {
    files.push({ path: `feeds/${slug}.ics`, body: calendar(`PhD TV: ${slug}`, (d) => d.disciplines.some((x) => x.slug === slug)) });
  }

  const exported = defenses.map((d) => ({ ...d, url: new URL(d.url, site).href, listingUrl: new URL(d.listingUrl, site).href }));
  const body = { schemaVersion: SCHEMA_VERSION, generatedAt: renderedAt, defenses: exported };
  files.push({ path: 'api/defenses.json', body: `${JSON.stringify(body, null, 2)}\n` });

  return files;
}
