import { describe, expect, it } from 'vitest';
import { defensePhase, institutionLabel, majorField, majorFieldName, toDefense, type DefenseInput } from '../../src/lib/defense.ts';

const input: DefenseInput = {
  id: '2026/2026-09-15-tudelft-jane-doe',
  body: 'An abstract.',
  record: {
    candidate: 'Jane Doe',
    title: 'Learning to schedule',
    university: 'tudelft',
    faculty: 'EEMCS',
    disciplines: ['computer-and-information-sciences', 'mathematics'],
    language: 'en',
    starts_at: '2026-09-15T12:30:00+02:00',
    timezone: 'Europe/Amsterdam',
    duration_minutes: 60,
    stream: { url: 'https://example.org/live', platform: 'university' },
    thesis_url: 'https://repository.example/1',
    status: 'published',
    source: { channel: 'scraped', url: 'https://www.tudelft.nl/agenda/x', last_seen: '2026-09-01T06:00:00Z' },
    verified_by: 'amv',
  },
  university: { slug: 'tudelft', name: 'Delft University of Technology', country: 'NL', timezone: 'Europe/Amsterdam', website: 'https://www.tudelft.nl/' },
  disciplineIndex: {
    'computer-and-information-sciences': { name: 'Computer and information sciences', major: 'natural-sciences', majorName: 'Natural sciences' },
    mathematics: { name: 'Mathematics', major: 'natural-sciences', majorName: 'Natural sciences' },
  },
  base: '/phdtv/',
};

const centerfold = {
  issue: 'No. 37',
  standfirst: 'Every phone call costs energy somewhere in the network.',
  portrait: '/img/centerfold/jane-doe/portrait.jpg',
  wide: 'https://example.org/lab.jpg',
  questions: [{ q: 'Why this topic?', a: 'Because it matters.' }],
  facts: [['Format', 'Public defense, livestreamed']] as Array<[string, string]>,
};

describe('toDefense', () => {
  const defense = toDefense(input);

  it('derives a stable key and page URL from the record id', () => {
    expect(defense.key).toBe('2026/2026-09-15-tudelft-jane-doe');
    expect(defense.url).toBe('/phdtv/defenses/2026/2026-09-15-tudelft-jane-doe/');
  });

  it('resolves the institution and discipline names', () => {
    expect(defense.university).toEqual({ slug: 'tudelft', name: 'Delft University of Technology', country: 'NL', website: 'https://www.tudelft.nl/' });
    expect(defense.disciplines).toEqual([
      { slug: 'computer-and-information-sciences', name: 'Computer and information sciences', major: 'natural-sciences', majorName: 'Natural sciences' },
      { slug: 'mathematics', name: 'Mathematics', major: 'natural-sciences', majorName: 'Natural sciences' },
    ]);
  });

  it('names the major field of its first discipline', () => {
    expect(majorFieldName(defense)).toBe('Natural sciences');
    expect(majorFieldName({ ...defense, disciplines: [] })).toBeUndefined();
  });

  it('carries the centerfold with its images resolved under the base, and a centerfold page URL', () => {
    const featured = toDefense({ ...input, record: { ...input.record, centerfold } });
    expect(featured.centerfoldUrl).toBe('/phdtv/centerfold/2026/2026-09-15-tudelft-jane-doe/');
    expect(featured.centerfold).toEqual({
      issue: 'No. 37',
      standfirst: 'Every phone call costs energy somewhere in the network.',
      portrait: '/phdtv/img/centerfold/jane-doe/portrait.jpg',
      wide: 'https://example.org/lab.jpg',
      questions: [{ q: 'Why this topic?', a: 'Because it matters.' }],
      facts: [['Format', 'Public defense, livestreamed']],
    });
  });

  it('has no centerfold fields at all when the record has no centerfold', () => {
    expect(defense.centerfold).toBeUndefined();
    expect(defense.centerfoldUrl).toBeUndefined();
    expect('centerfoldUrl' in defense).toBe(false);
  });

  it('carries the scheduling fields as ISO strings', () => {
    expect(defense.startsAt).toBe('2026-09-15T12:30:00+02:00');
    expect(defense.endsAt).toBe('2026-09-15T11:30:00.000Z');
    expect(defense.timezone).toBe('Europe/Amsterdam');
    expect(defense.durationMinutes).toBe(60);
  });

  it('keeps links, attribution and the body', () => {
    expect(defense.stream).toEqual({ url: 'https://example.org/live', platform: 'university' });
    expect(defense.recording).toBeUndefined();
    expect(defense.thesisUrl).toBe('https://repository.example/1');
    expect(defense.source).toEqual({ channel: 'scraped', url: 'https://www.tudelft.nl/agenda/x' });
    expect(defense.abstract).toBe('An abstract.');
  });

  it('omits optional fields that are absent rather than emitting nulls', () => {
    const { faculty: _f, language: _l, thesis_url: _t, stream: _s, duration_minutes: _d, ...bare } = input.record;
    const minimal = toDefense({ ...input, record: bare, body: '' });
    expect(minimal.faculty).toBeUndefined();
    expect(minimal.durationMinutes).toBe(90);
    expect(minimal.abstract).toBeUndefined();
  });

  it('carries the short institution name when the registry has one', () => {
    const withShort = toDefense({ ...input, university: { ...input.university, short_name: 'TU Delft' } });
    expect(withShort.university.shortName).toBe('TU Delft');
    expect(institutionLabel(withShort)).toBe('TU Delft');
    expect(institutionLabel(defense)).toBe('Delft University of Technology');
  });

  it('classifies its phase against a clock and names its first major field', () => {
    expect(defensePhase(defense, new Date('2026-09-15T10:00:00Z'))).toBe('upcoming');
    expect(defensePhase(defense, new Date('2026-09-15T10:45:00Z'))).toBe('live');
    expect(defensePhase(defense, new Date('2026-09-15T12:00:00Z'))).toBe('past');
    expect(majorField(defense)).toBe('natural-sciences');
    expect(majorField({ ...defense, disciplines: [] })).toBeUndefined();
  });
});
