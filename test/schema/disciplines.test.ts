import { describe, expect, it } from 'vitest';
import { loadDisciplines } from '../../src/schema/disciplines.ts';

describe('disciplines vocabulary', () => {
  const vocab = loadDisciplines();

  it('has the 42 OECD Frascati minor fields', () => {
    expect(vocab.minors).toHaveLength(42);
  });

  it('has the 6 OECD major fields', () => {
    expect(vocab.majors).toHaveLength(6);
  });

  it('uses unique kebab-case slugs', () => {
    const slugs = vocab.minors.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('assigns every minor field to an existing major field', () => {
    const majors = new Set(vocab.majors.map((m) => m.slug));
    for (const minor of vocab.minors) expect(majors.has(minor.major), minor.slug).toBe(true);
  });

  it('exposes the slug set for validation', () => {
    expect(vocab.slugs.has('computer-and-information-sciences')).toBe(true);
    expect(vocab.slugs.has('astrology')).toBe(false);
  });
});
