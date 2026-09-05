# Astro era (2026-09-03 to 2026-09-05)

Retired when the site moved to `scripts/build.ts`; kept for the history behind the pins.

- astro was pinned to `~7.2.10`: 7.3.0 imported an unexported `astro/_internal/logger` and could not build.
- Astro parsed frontmatter with js-yaml 4, which is why the validator pinned js-yaml 4 to match; the pin outlived Astro because the schema's quote-your-timestamps rule depends on it.
- Vitest mirrors `import.meta.env` (`BASE_URL`, `MODE`, `DEV`, `PROD`, `SSR`) into `process.env`; an Astro build spawned from a test inherited `BASE_URL=/` and silently dropped the site base. The old `test/build/helpers.ts` stripped those keys.
- Division of labour: `.astro` files only under `src/pages/` and `src/layouts/` (routing, collections, endpoints, document shell); every visible element was a React component, two of them hydrated with `client:load`.
