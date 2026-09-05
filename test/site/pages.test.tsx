import { describe, expect, it } from 'vitest';
import type { AssetManifest } from '../../src/site/assets.ts';
import { Document } from '../../src/site/document.tsx';
import { archivePage, defensePage, homePage, renderDocument } from '../../src/site/pages.tsx';
import { fixtureDefense } from '../fixtures/defenses.ts';

const manifest: AssetManifest = {
  'src/styles/global.css': { file: 'assets/global-abc.css' },
  'src/site/client/schedule.tsx': { file: 'assets/schedule-123.js', imports: ['_react-xyz.js'] },
  'src/site/client/defense.tsx': { file: 'assets/defense-456.js', imports: ['_react-xyz.js'] },
  '_react-xyz.js': { file: 'assets/react-xyz.js' },
};
const ctx = { base: '/phdtv/', manifest, renderedAt: '2026-09-05T12:00:00.000Z' };

describe('Document', () => {
  it('renders one complete HTML document with the head links and the body scripts', () => {
    const html = renderDocument(
      <Document title="T" description="D" base="/phdtv/" assets={{ styles: ['/phdtv/assets/g.css'], scripts: ['/phdtv/assets/s.js'], preloads: ['/phdtv/assets/r.js'] }}>
        <p>body</p>
      </Document>,
    );
    expect(html.startsWith('<!doctype html>\n<html lang="en">')).toBe(true);
    expect(html.match(/<!doctype/gi)).toHaveLength(1);
    expect(html).toContain('<title>T</title>');
    expect(html).toContain('<meta name="description" content="D"/>');
    expect(html).toContain('<link rel="alternate" type="text/calendar" title="PhD TV: all defenses" href="/phdtv/feeds/all.ics"/>');
    expect(html).toContain('<link rel="stylesheet" href="/phdtv/assets/g.css"/>');
    expect(html).toContain('<link rel="modulepreload" href="/phdtv/assets/r.js"/>');
    expect(html).toContain('<p>body</p><script type="module" src="/phdtv/assets/s.js"></script></body></html>');
  });
});

describe('pages', () => {
  const defense = fixtureDefense();

  it('home page: schedule island in upcoming mode, its script, and the static markup as fallback', () => {
    const html = homePage([defense], ctx);
    expect(html).toContain('<title>PhD TV</title>');
    expect(html).toContain('PhD defenses you can watch live');
    expect(html).toContain('data-island="DefenseSchedule"');
    expect(html).toContain('"mode":"upcoming"');
    expect(html).toContain('"renderedAt":"2026-09-05T12:00:00.000Z"');
    expect(html).toContain('src="/phdtv/assets/schedule-123.js"');
    expect(html).toContain('href="/phdtv/assets/global-abc.css"');
    expect(html).toContain('Jane Doe');
  });

  it('archive page: schedule island in archive mode', () => {
    const html = archivePage([defense], ctx);
    expect(html).toContain('<title>PhD TV: archive</title>');
    expect(html).toContain('Past defenses');
    expect(html).toContain('"mode":"archive"');
  });

  it('defense page: candidate and title in the title, detail island with base and build time, nav with base', () => {
    const html = defensePage(defense, ctx);
    expect(html).toContain('<title>Jane Doe: Learning to schedule under uncertainty</title>');
    expect(html).toContain('<meta name="description" content="PhD defense at Delft University of Technology."/>');
    expect(html).toContain('data-island="DefensePage"');
    expect(html).toContain('"base":"/phdtv/"');
    expect(html).toContain('src="/phdtv/assets/defense-456.js"');
    expect(html).toContain('href="/phdtv/archive/"');
  });
});
