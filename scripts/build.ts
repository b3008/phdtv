// Build the static site: bundled assets, pages, calendar feeds and the JSON export, into dist/ (or --out).
import { parseArgs } from 'node:util';
import { buildSite } from '../src/site/build.ts';

const { values } = parseArgs({
  options: {
    out: { type: 'string', default: 'dist' },
    root: { type: 'string', default: '.' },
  },
});

// GitHub Pages project sites live under /<repo>; the deploy workflow sets both from the repository name.
const site = process.env['SITE_URL'] ?? 'https://b3008.github.io';
const base = process.env['SITE_BASE'] ?? '/phdtv';

const started = Date.now();
const files = await buildSite({ rootDir: values.root, outDir: values.out, site, base });
console.log(`Built ${files.length} files into ${values.out} for ${new URL(base, site).href} in ${Date.now() - started} ms.`);
