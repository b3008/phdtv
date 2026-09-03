import { getCollection } from 'astro:content';
import { feedEvents } from './feed.ts';
import { readFileHistories } from './git-meta.ts';
import { renderCalendar } from './ics.ts';
import { loadPublishedDefenses } from './site-data.ts';

const histories = readFileHistories(process.cwd());

/** Render a calendar for the published defenses matching `keep`, sharing one git history read per build. */
export async function renderFeed(site: URL | undefined, name: string, keep: (d: Awaited<ReturnType<typeof loadPublishedDefenses>>[number]) => boolean) {
  if (!site) throw new Error('astro.config site must be set to build absolute feed URLs');
  const defenses = (await loadPublishedDefenses(import.meta.env.BASE_URL)).filter(keep);
  const events = feedEvents(defenses, { histories, now: new Date(), site: site.href });
  return new Response(renderCalendar(events, { name }), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
}

export async function disciplineSlugs(): Promise<string[]> {
  return (await getCollection('disciplines')).map((d) => d.data.slug);
}
