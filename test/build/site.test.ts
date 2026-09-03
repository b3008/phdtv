import ICAL from 'ical.js';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { loadRecordFiles } from '../../src/lib/records.ts';
import { recordSchema } from '../../src/schema/record.ts';
import { buildSite } from './helpers.ts';

// One file so the site is built exactly once; parallel test workers would run two builds at the same time.

let dist: string;
beforeAll(() => {
  dist = buildSite();
}, 200_000);

function events(file: string) {
  const text = readFileSync(join(dist, file), 'utf8');
  const component = new ICAL.Component(ICAL.parse(text));
  return component.getAllSubcomponents('vevent').map((c) => new ICAL.Event(c));
}

const records = loadRecordFiles('.').map((f) => ({ path: f.path, record: recordSchema.parse(f.data) }));
const hiddenOrUnverified = records.filter((r) => r.record.status !== 'published').map((r) => r.record.candidate);

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
    const files = readdirSync(join(dist, 'feeds')).filter((f) => f.endsWith('.ics') && f !== 'all.ics');
    expect(files.length).toBe(42);
    const law = events('feeds/law.ics').map((e) => e.summary);
    expect(law.some((s) => s.startsWith('Lina Stotz:'))).toBe(true);
    expect(law.some((s) => s.startsWith('Chris ten Dam:'))).toBe(false);
  });
});

interface Export {
  schemaVersion: number;
  generatedAt: string;
  defenses: Array<{ key: string; candidate: string; url: string; university: { name: string }; status: string }>;
}

describe('api/defenses.json', () => {
  it('has a schema version, a generation time and every published record', () => {
    const data = JSON.parse(readFileSync(join(dist, 'api/defenses.json'), 'utf8')) as Export;
    expect(data.schemaVersion).toBe(1);
    expect(new Date(data.generatedAt).toString()).not.toBe('Invalid Date');
    const published = loadRecordFiles('.').map((f) => recordSchema.parse(f.data)).filter((r) => r.status === 'published');
    expect(data.defenses).toHaveLength(published.length);
    expect(data.defenses.every((d) => d.status === 'published')).toBe(true);
  });

  it('resolves institution names and absolute page URLs', () => {
    const data = JSON.parse(readFileSync(join(dist, 'api/defenses.json'), 'utf8')) as Export;
    const one = data.defenses.find((d) => d.key === '2026/2026-09-15-utrecht-chris-ten-dam');
    expect(one?.university.name).toBe('Utrecht University');
    expect(one?.url).toBe('https://example.test/phdtv/defenses/2026/2026-09-15-utrecht-chris-ten-dam/');
  });
});
