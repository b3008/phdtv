import { describe, expect, it } from 'vitest';
import { pageAssets, type AssetManifest } from '../../src/site/assets.ts';

const manifest: AssetManifest = {
  'src/styles/global.css': { file: 'assets/global-abc.css' },
  'src/site/client/schedule.tsx': { file: 'assets/schedule-123.js', imports: ['_react-xyz.js'] },
  'src/site/client/defense.tsx': { file: 'assets/defense-456.js', imports: ['_react-xyz.js'] },
  '_react-xyz.js': { file: 'assets/react-xyz.js' },
};

describe('pageAssets', () => {
  it('prefixes the stylesheet, the island script and its shared chunks with the base', () => {
    expect(pageAssets(manifest, '/phdtv/', ['DefenseSchedule'])).toEqual({
      styles: ['/phdtv/assets/global-abc.css'],
      scripts: ['/phdtv/assets/schedule-123.js'],
      preloads: ['/phdtv/assets/react-xyz.js'],
    });
  });

  it('works at the root base and lists a shared chunk once for two islands', () => {
    const assets = pageAssets(manifest, '/', ['DefenseSchedule', 'DefensePage']);
    expect(assets.scripts).toEqual(['/assets/schedule-123.js', '/assets/defense-456.js']);
    expect(assets.preloads).toEqual(['/assets/react-xyz.js']);
  });

  it('fails loudly when the manifest lacks an entry', () => {
    expect(() => pageAssets({}, '/', [])).toThrow('src/styles/global.css');
  });
});
