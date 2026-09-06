import { describe, expect, it } from 'vitest';
import { applyFilters, filtersFromSearch, searchFromFilters, type Filters } from '../../src/lib/filters.ts';
import { fixtureDefense } from '../fixtures/defenses.ts';

const a = fixtureDefense({ key: 'a', university: { slug: 'tudelft', name: 'TU Delft', country: 'NL' }, disciplines: [{ slug: 'mathematics', name: 'Mathematics', major: 'natural-sciences' }] });
const b = fixtureDefense({ key: 'b', university: { slug: 'uu', name: 'Utrecht', country: 'NL' }, disciplines: [{ slug: 'law', name: 'Law', major: 'social-sciences' }], recording: { url: 'https://youtu.be/x', platform: 'youtube' } });
const c = fixtureDefense({ key: 'c', university: { slug: 'tudelft', name: 'TU Delft', country: 'NL' }, disciplines: [{ slug: 'law', name: 'Law', major: 'social-sciences' }, { slug: 'mathematics', name: 'Mathematics', major: 'natural-sciences' }] });

describe('applyFilters', () => {
  it('returns everything for empty filters', () => {
    expect(applyFilters([a, b, c], {}).map((d) => d.key)).toEqual(['a', 'b', 'c']);
  });
  it('filters by discipline', () => {
    expect(applyFilters([a, b, c], { discipline: 'law' }).map((d) => d.key)).toEqual(['b', 'c']);
  });
  it('filters by institution', () => {
    expect(applyFilters([a, b, c], { university: 'tudelft' }).map((d) => d.key)).toEqual(['a', 'c']);
  });
  it('combines filters', () => {
    expect(applyFilters([a, b, c], { university: 'tudelft', discipline: 'law' }).map((d) => d.key)).toEqual(['c']);
  });
  it('keeps only defenses with a recording when asked', () => {
    expect(applyFilters([a, b, c], { recordedOnly: true }).map((d) => d.key)).toEqual(['b']);
  });
});

describe('filters in the query string', () => {
  it('round-trips through the URL', () => {
    const filters: Filters = { discipline: 'law', university: 'uu', recordedOnly: true };
    expect(searchFromFilters(filters)).toBe('?discipline=law&university=uu&recorded=1');
    expect(filtersFromSearch('?discipline=law&university=uu&recorded=1')).toEqual(filters);
  });
  it('gives an empty string and empty filters when nothing is set', () => {
    expect(searchFromFilters({})).toBe('');
    expect(filtersFromSearch('')).toEqual({});
  });
});
