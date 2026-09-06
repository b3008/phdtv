import { describe, expect, it } from 'vitest';
import { universitySchema } from '../../src/schema/university.ts';

const valid = {
  slug: 'tudelft',
  name: 'Delft University of Technology',
  country: 'NL',
  timezone: 'Europe/Amsterdam',
  website: 'https://www.tudelft.nl/',
  agenda_url: 'https://www.tudelft.nl/en/events',
  aliases: ['TU Delft'],
};

function firstIssuePath(data: unknown): string {
  const result = universitySchema.safeParse(data);
  if (result.success) throw new Error('expected failure');
  return result.error.issues.map((i) => i.path.join('.')).join(',');
}

describe('universitySchema', () => {
  it('accepts a complete entry', () => {
    const result = universitySchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts an entry with only the required fields', () => {
    const { slug, name, country, timezone } = valid;
    expect(universitySchema.safeParse({ slug, name, country, timezone }).success).toBe(true);
  });

  it.each(['slug', 'name', 'country', 'timezone'] as const)('reports a missing %s', (field) => {
    const { [field]: _omitted, ...rest } = valid;
    expect(firstIssuePath(rest)).toBe(field);
  });

  it('rejects a slug that is not kebab-case', () => {
    expect(firstIssuePath({ ...valid, slug: 'TU Delft' })).toBe('slug');
  });

  it('rejects a country that is not ISO 3166-1 alpha-2', () => {
    expect(firstIssuePath({ ...valid, country: 'NLD' })).toBe('country');
  });

  it('rejects an unassigned alpha-2 country code', () => {
    expect(firstIssuePath({ ...valid, country: 'XX' })).toBe('country');
  });

  it('rejects a time zone that is not an IANA name', () => {
    expect(firstIssuePath({ ...valid, timezone: 'Europe/Nowhere' })).toBe('timezone');
  });

  it('rejects a website that is not a URL', () => {
    expect(firstIssuePath({ ...valid, website: 'tudelft.nl' })).toBe('website');
  });

  it('rejects unknown fields and names them', () => {
    const result = universitySchema.safeParse({ ...valid, mascot: 'owl' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('mascot');
  });

  it('accepts an optional short_name and rejects an empty one', () => {
    expect(universitySchema.safeParse({ ...valid, short_name: 'TU Delft' }).success).toBe(true);
    expect(firstIssuePath({ ...valid, short_name: '  ' })).toBe('short_name');
  });
});
