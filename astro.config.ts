import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// GitHub Pages project sites live under /<repo>; both values are overridable
// from the deploy workflow so the repository name is not hard-coded here.
const site = process.env['SITE_URL'] ?? 'https://b3008.github.io';
const base = process.env['SITE_BASE'] ?? '/phdtv';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [react()],
});
