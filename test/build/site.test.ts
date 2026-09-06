import ICAL from 'ical.js';
import { describe, expect, it } from 'vitest';
import { loadRecordFiles } from '../../src/lib/records.ts';
import { recordSchema } from '../../src/schema/record.ts';
import type { AssetManifest } from '../../src/site/assets.ts';
import { generate } from '../../src/site/generate.ts';

// The generator runs in-process against the real repository with a stub manifest; the Vite bundling step is
// exercised once, separately, in bundle.test.ts.
const manifest: AssetManifest = {
  'src/styles/global.css': { file: 'assets/global-test.css' },
  'src/site/client/calendar.tsx': { file: 'assets/calendar-test.js' },
  'src/site/client/defense.tsx': { file: 'assets/defense-test.js' },
};
// Pinned so the feed-window assertions below do not drift as the seed defenses age.
const NOW = new Date('2026-09-05T12:00:00Z');

const files = generate({ rootDir: '.', site: 'https://example.test', base: '/phdtv/', manifest, now: NOW });
const output = new Map(files.map((f) => [f.path, f.body]));
const read = (path: string) => {
  const body = output.get(path);
  if (body === undefined) throw new Error(`${path} was not generated`);
  return body;
};

function events(file: string) {
  const component = new ICAL.Component(ICAL.parse(read(file)));
  return component.getAllSubcomponents('vevent').map((c) => new ICAL.Event(c));
}

const records = loadRecordFiles('.').map((f) => ({ path: f.path, record: recordSchema.parse(f.data) }));
const published = records.filter((r) => r.record.status === 'published');
const hiddenOrUnverified = records.filter((r) => r.record.status !== 'published').map((r) => r.record.candidate);

describe('pages', () => {
  it('generates each path once', () => {
    expect(output.size).toBe(files.length);
  });

  it('generates the two list pages and one page per published defense', () => {
    expect(read('index.html')).toContain('data-island="DefenseCalendar"');
    expect(read('archive/index.html')).toContain('http-equiv="refresh"');
    const pages = [...output.keys()].filter((p) => p.startsWith('defenses/'));
    expect(pages).toHaveLength(published.length);
    for (const r of published) expect(output.has(`defenses/${r.path.replace(/^records\//, '').replace(/\.md$/, '')}/index.html`)).toBe(true);
  });

  it('gives a defense page its title, island, assets and feed link', () => {
    const page = read('defenses/2026/2026-09-15-utrecht-chris-ten-dam/index.html');
    expect(page).toContain('<title>Chris ten Dam: Built environment transformation for the transport energy transition</title>');
    expect(page).toContain('data-island="DefensePage"');
    expect(page).toContain('src="/phdtv/assets/defense-test.js"');
    expect(page).toContain('href="/phdtv/assets/global-test.css"');
    expect(page).toContain('href="/phdtv/feeds/all.ics"');
    expect(page).toContain('"renderedAt":"2026-09-05T12:00:00.000Z"');
  });
});

describe('feeds/all.ics', () => {
  it('is a parseable calendar with one event per listed defense and stable UIDs', () => {
    const all = events('feeds/all.ics');
    expect(all.length).toBeGreaterThan(0);
    for (const e of all) expect(e.uid).toMatch(/^2026\/2026-\d{2}-\d{2}-[a-z0-9-]+@phdtv$/);
  });

  it('contains upcoming defenses and defenses that ended within the last 30 days, nothing older', () => {
    const summaries = events('feeds/all.ics').map((e) => e.summary);
    expect(summaries.some((s) => s.startsWith('Chris ten Dam:'))).toBe(true);
    expect(summaries.some((s) => s.startsWith('Jari Saastamoinen:'))).toBe(true);
    expect(summaries.some((s) => s.startsWith('Sanne Vrijenhoek:'))).toBe(false);
  });

  it('excludes hidden and unverified records', () => {
    const summaries = events('feeds/all.ics').map((e) => e.summary);
    for (const name of hiddenOrUnverified) expect(summaries.some((s) => s.startsWith(`${name}:`))).toBe(false);
  });

  it('carries the stream link and a page URL', () => {
    const e = events('feeds/all.ics').find((x) => x.summary.startsWith('Chris ten Dam:'));
    expect(e?.description).toContain('https://video.uu.nl/lives/senate-hall-phd-defense-2026-2027/');
    expect(e?.component.getFirstPropertyValue('url')).toBe('https://example.test/phdtv/defenses/2026/2026-09-15-utrecht-chris-ten-dam/');
    expect(e?.startDate.toJSDate().toISOString()).toBe('2026-09-15T14:15:00.000Z');
    expect(e?.sequence).toBeGreaterThanOrEqual(1);
  });
});

describe('per-discipline feeds', () => {
  it('exist for every discipline slug and contain only matching defenses', () => {
    const feeds = [...output.keys()].filter((p) => p.startsWith('feeds/') && p !== 'feeds/all.ics');
    expect(feeds).toHaveLength(42);
    const law = events('feeds/law.ics').map((e) => e.summary);
    expect(law.some((s) => s.startsWith('Lina Stotz:'))).toBe(true);
    expect(law.some((s) => s.startsWith('Chris ten Dam:'))).toBe(false);
  });
});

interface Export {
  schemaVersion: number;
  generatedAt: string;
  defenses: Array<{
    key: string;
    candidate: string;
    url: string;
    university: { name: string; shortName?: string };
    disciplines: Array<{ slug: string; major: string }>;
    status: string;
  }>;
}

describe('api/defenses.json', () => {
  const data = JSON.parse(read('api/defenses.json')) as Export;

  it('has a schema version, the generation time and every published record', () => {
    expect(data.schemaVersion).toBe(1);
    expect(data.generatedAt).toBe('2026-09-05T12:00:00.000Z');
    expect(data.defenses).toHaveLength(published.length);
    expect(data.defenses.every((d) => d.status === 'published')).toBe(true);
  });

  it('resolves institution names and absolute page URLs', () => {
    const one = data.defenses.find((d) => d.key === '2026/2026-09-15-utrecht-chris-ten-dam');
    expect(one?.university.name).toBe('Utrecht University');
    expect(one?.url).toBe('https://example.test/phdtv/defenses/2026/2026-09-15-utrecht-chris-ten-dam/');
    expect(one?.university.shortName).toBe('UU');
    expect(one?.disciplines.map((d) => d.major)).toContain('social-sciences');
  });
});
