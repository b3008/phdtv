import { describe, expect, it } from 'vitest';
import { recordSchema } from '../../src/schema/record.ts';

const valid = {
  candidate: 'Jane Doe',
  title: 'Learning to schedule under uncertainty',
  university: 'tudelft',
  faculty: 'Electrical Engineering, Mathematics and Computer Science',
  disciplines: ['computer-and-information-sciences'],
  language: 'en',
  starts_at: '2026-09-15T12:30:00+02:00',
  timezone: 'Europe/Amsterdam',
  duration_minutes: 60,
  stream: { url: 'https://www.youtube.com/watch?v=abc123', platform: 'youtube' },
  thesis_url: 'https://repository.tudelft.nl/record/1',
  status: 'published',
  source: { channel: 'curated' },
  verified_by: 'amv',
};

function issues(data: unknown): Array<{ path: string; message: string }> {
  const result = recordSchema.safeParse(data);
  if (result.success) throw new Error('expected failure');
  return result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
}
const paths = (data: unknown) => issues(data).map((i) => i.path);

describe('recordSchema', () => {
  it('accepts a complete published record', () => {
    expect(recordSchema.safeParse(valid).success).toBe(true);
  });

  it.each(['candidate', 'title', 'university', 'starts_at', 'timezone', 'status', 'source'] as const)(
    'reports a missing %s',
    (field) => {
      const { [field]: _omitted, ...rest } = valid;
      expect(paths(rest)).toContain(field);
    },
  );

  it('tells the author to quote a timestamp that YAML turned into a Date', () => {
    const found = issues({ ...valid, starts_at: new Date('2026-09-15T10:30:00Z') });
    expect(found[0]?.path).toBe('starts_at');
    expect(found[0]?.message).toMatch(/quoted/);
  });

  it('rejects a timestamp without a UTC offset', () => {
    expect(paths({ ...valid, starts_at: '2026-09-15T12:30:00' })).toEqual(['starts_at']);
  });

  it('rejects an offset that does not match the time zone at that instant', () => {
    const found = issues({ ...valid, starts_at: '2026-09-15T12:30:00+01:00' });
    expect(found).toHaveLength(1);
    expect(found[0]?.path).toBe('starts_at');
    expect(found[0]?.message).toContain('+02:00');
  });

  it('accepts the winter offset of the same zone', () => {
    expect(recordSchema.safeParse({ ...valid, starts_at: '2026-01-15T12:30:00+01:00' }).success).toBe(true);
  });

  it('requires verified_by on a published record', () => {
    const { verified_by: _omitted, ...rest } = valid;
    expect(paths(rest)).toEqual(['verified_by']);
  });

  it('allows an unverified record without verified_by', () => {
    const { verified_by: _omitted, ...rest } = valid;
    expect(recordSchema.safeParse({ ...rest, status: 'unverified' }).success).toBe(true);
  });

  it('requires source.url on a scraped record', () => {
    expect(paths({ ...valid, source: { channel: 'scraped', last_seen: '2026-09-01T06:00:00Z' } })).toEqual(['source.url']);
  });

  it('requires source.submitted_at on a submitted record', () => {
    expect(paths({ ...valid, source: { channel: 'submitted' } })).toEqual(['source.submitted_at']);
  });

  it('accepts a recording with a url and platform', () => {
    const recording = { url: 'https://youtu.be/xyz', platform: 'youtube' };
    expect(recordSchema.safeParse({ ...valid, recording }).success).toBe(true);
  });

  it('accepts a recording that explicitly does not exist', () => {
    expect(recordSchema.safeParse({ ...valid, recording: { status: 'none' } }).success).toBe(true);
  });

  it('rejects a recording that is neither a link nor status none', () => {
    expect(paths({ ...valid, recording: { status: 'maybe' } })[0]).toMatch(/^recording/);
  });

  it('rejects a discipline outside the vocabulary', () => {
    expect(paths({ ...valid, disciplines: ['computer-and-information-sciences', 'astrology'] })).toEqual(['disciplines.1']);
  });

  it('rejects a language that is not a BCP 47 tag', () => {
    expect(paths({ ...valid, language: 'english' })).toEqual(['language']);
  });

  it('accepts a regional language tag', () => {
    expect(recordSchema.safeParse({ ...valid, language: 'nl-NL' }).success).toBe(true);
  });

  it('rejects unknown fields and names them', () => {
    expect(issues({ ...valid, mascot: 'owl' })[0]?.message).toContain('mascot');
  });

  it('rejects a stream url that is not http(s)', () => {
    expect(paths({ ...valid, stream: { url: 'rtmp://x', platform: 'other' } })).toEqual(['stream.url']);
  });

  describe('centerfold', () => {
    const centerfold = {
      issue: 'No. 37',
      kicker: "This week's centerfold",
      standfirst: 'Every phone call costs energy somewhere in the network.',
      portrait: '/img/centerfold/anders-enqvist/portrait.jpg',
      wide: 'https://example.org/lab.jpg',
      quote: 'How little can a wireless link get away with?',
      questions: [{ q: 'Why this topic?', a: 'Because it matters.' }, { q: 'What surprised you?' }],
      facts: [
        ['Faculty', 'Electrical Engineering and Computer Science'],
        ['Language', 'English'],
      ],
    };

    it('accepts a block with every editorial field', () => {
      expect(recordSchema.safeParse({ ...valid, centerfold }).success).toBe(true);
    });

    it('accepts an empty block, since every field is editorial', () => {
      expect(recordSchema.safeParse({ ...valid, centerfold: {} }).success).toBe(true);
    });

    it('rejects unknown centerfold fields and names them', () => {
      expect(issues({ ...valid, centerfold: { mascot: 'owl' } })[0]?.message).toContain('mascot');
    });

    it('rejects a fact that is not a key and value pair', () => {
      expect(paths({ ...valid, centerfold: { facts: [['Faculty']] } })[0]).toMatch(/^centerfold\.facts\.0/);
    });

    it('rejects an image that is neither a site-relative path nor an http(s) URL', () => {
      expect(paths({ ...valid, centerfold: { portrait: 'portrait.jpg' } })).toEqual(['centerfold.portrait']);
    });

    it('requires the question text of a Q&A entry', () => {
      expect(paths({ ...valid, centerfold: { questions: [{ a: 'An answer without a question' }] } })).toEqual(['centerfold.questions.0.q']);
    });
  });
});
