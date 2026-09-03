import { describe, expect, it } from 'vitest';
import { withBase } from '../../src/lib/paths.ts';

describe('withBase', () => {
  it('joins a base with a trailing slash and a path without a leading slash', () => {
    expect(withBase('/phdtv/', 'archive/')).toBe('/phdtv/archive/');
  });
  it('joins a base without a trailing slash and a path with a leading slash', () => {
    expect(withBase('/phdtv', '/archive/')).toBe('/phdtv/archive/');
  });
  it('returns the base itself for the root path', () => {
    expect(withBase('/phdtv/', '/')).toBe('/phdtv/');
    expect(withBase('/', '/')).toBe('/');
  });
});
