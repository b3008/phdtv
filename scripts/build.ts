// Build the static site: bundled assets, pages, calendar feeds and the JSON export, into dist/ (or --out).
import { parseArgs } from 'node:util';
import { buildSite } from '../src/site/build.ts';

const { values } = parseArgs({
  options: {
    out: { type: 'string', default: 'dist' },
    root: { type: 'string', default: '.' },
  },
});

// The canonical site is https://phdtv.net at the root; the deploy workflow sets both explicitly.
const site = process.env['SITE_URL'] ?? 'https://phdtv.net';
const base = process.env['SITE_BASE'] ?? '/';
// SITE_PREVIEW=1 shows slots for empty editorial fields on centerfold pages; the deploy leaves it unset.
const preview = process.env['SITE_PREVIEW'] === '1';

const started = Date.now();
const files = await buildSite({ rootDir: values.root, outDir: values.out, site, base, preview });
console.log(`Built ${files.length} files into ${values.out} for ${new URL(base, site).href} in ${Date.now() - started} ms.`);
