import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadSiteData } from '../../src/site/data.ts';

describe('loadSiteData on the repository', () => {
  const data = loadSiteData('.', '/phdtv/');

  it('returns only published defenses, soonest first, with collection-style ids and base-prefixed urls', () => {
    expect(data.defenses.length).toBeGreaterThan(0);
    expect(data.defenses.every((d) => d.status === 'published')).toBe(true);
    const starts = data.defenses.map((d) => d.startsAt);
    expect(starts).toEqual([...starts].sort());
    const one = data.defenses.find((d) => d.key === '2026/2026-09-15-utrecht-chris-ten-dam');
    expect(one?.url).toBe('/phdtv/defenses/2026/2026-09-15-utrecht-chris-ten-dam/');
    expect(one?.university.name).toBe('Utrecht University');
    expect(one?.disciplines.map((d) => d.name)).toContain('Social and economic geography');
  });

  it('lists every discipline slug of the vocabulary', () => {
    expect(data.disciplineSlugs).toHaveLength(42);
    expect(data.disciplineSlugs).toContain('law');
  });

  it('resolves each discipline to its major field and lists the majors', () => {
    const one = data.defenses.find((d) => d.key === '2026/2026-09-15-utrecht-chris-ten-dam');
    expect(one?.disciplines.map((d) => d.major)).toContain('social-sciences');
    expect(data.majors.map((m) => m.slug)).toEqual([
      'natural-sciences',
      'engineering-and-technology',
      'medical-and-health-sciences',
      'agricultural-and-veterinary-sciences',
      'social-sciences',
      'humanities-and-the-arts',
    ]);
    expect(one?.university.shortName).toBe('UU');
  });
});

/** A throwaway project: the valid one-record fixture plus the real vocabulary, with extra files layered on top. */
function project(extra: Record<string, string> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), 'phdtv-data-'));
  cpSync('test/fixtures/links-project', dir, { recursive: true });
  cpSync('disciplines.yaml', join(dir, 'disciplines.yaml'));
  for (const [path, body] of Object.entries(extra)) {
    mkdirSync(join(dir, path, '..'), { recursive: true });
    writeFileSync(join(dir, path), body);
  }
  return dir;
}

const record = (fields: string) =>
  `---\ncandidate: Some One\ntitle: A thesis\n${fields}\ntimezone: Europe/Amsterdam\nstatus: published\nsource:\n  channel: curated\nverified_by: amv\n---\n`;

describe('loadSiteData on a small project', () => {
  it('builds the view model from the record, its university and the body', () => {
    const { defenses } = loadSiteData(project(), '/');
    expect(defenses).toHaveLength(1);
    expect(defenses[0]?.key).toBe('2026/2026-09-15-tudelft-jane-doe');
    expect(defenses[0]?.url).toBe('/defenses/2026/2026-09-15-tudelft-jane-doe/');
    expect(defenses[0]?.university).toEqual({ slug: 'tudelft', name: 'Delft University of Technology', country: 'NL', website: 'https://www.tudelft.nl/' });
    expect(defenses[0]?.recording).toEqual({ url: 'https://www.youtube.com/watch?v=abc', platform: 'youtube' });
  });

  it('leaves out records that are not published', () => {
    const dir = project({
      'records/2026/2026-09-20-tudelft-some-one.md': record('university: tudelft\nstarts_at: "2026-09-20T10:00:00+02:00"').replace('status: published', 'status: hidden'),
    });
    expect(loadSiteData(dir, '/').defenses.map((d) => d.candidate)).toEqual(['Jane Doe']);
  });

  it('fails on a record whose university is not in the registry', () => {
    const dir = project({ 'records/2026/2026-09-20-nowhere-some-one.md': record('university: nowhere\nstarts_at: "2026-09-20T10:00:00+02:00"') });
    expect(() => loadSiteData(dir, '/')).toThrow('2026/2026-09-20-nowhere-some-one: university "nowhere" is not in the registry');
  });

  it('fails on a record that does not match the schema, naming the file', () => {
    const dir = project({ 'records/2026/2026-09-20-tudelft-some-one.md': record('university: tudelft\nstarts_at: 2026-09-20T10:00:00+02:00') });
    expect(() => loadSiteData(dir, '/')).toThrow(/^records\/2026\/2026-09-20-tudelft-some-one\.md: starts_at/);
  });

  it('fails on a university file that is not valid YAML', () => {
    const dir = project({ 'universities/broken.yaml': 'slug: [\n' });
    expect(() => loadSiteData(dir, '/')).toThrow(/^universities\/broken\.yaml: invalid YAML/);
  });
});
