import { describe, expect, it } from 'vitest';
import { slugify } from '../../src/lib/slug.ts';

describe('slugify', () => {
  it('lower-cases and hyphenates words', () => {
    expect(slugify('Jane Doe')).toBe('jane-doe');
  });
  it('strips diacritics to ASCII', () => {
    expect(slugify('José Ñíguez Ångström')).toBe('jose-niguez-angstrom');
  });
  it('collapses punctuation and repeated separators', () => {
    expect(slugify("O'Brien-Smith,  Jr.")).toBe('o-brien-smith-jr');
  });
  it('transliterates letters that do not decompose', () => {
    expect(slugify('Søren Æbelø Straße')).toBe('soren-aebelo-strasse');
  });
  it('drops characters with no ASCII equivalent', () => {
    expect(slugify('李 华 Li')).toBe('li');
  });
});
