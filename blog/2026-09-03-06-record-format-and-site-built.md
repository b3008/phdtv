---
type: "Devlog Entry"
title: "record-format-and-site built: 27 of 30 tasks, waiting on a GitHub repository"
date: 2026-09-03
timestamp: 2026-09-03T15:26:12
tags: [feature, infrastructure, testing]
description: "Implemented the whole foundational change test-first: schemas, validator, 22 real seed defenses, the Astro plus React site, feeds, export and CI; only the GitHub-dependent tasks remain."
---

## What changed

One `/opsx:apply` session took `record-format-and-site` from an empty directory to a working project. Everything below was written test-first and lives in 16 commits on a local `main`:

- **Schemas** (`src/schema/`): Zod definitions for records and institutions, with the cross-field refinements the spec demands (offset must match the IANA zone at that instant, published requires `verified_by`, scraped requires a source URL). JSON Schema files are generated from them and CI fails when they go stale.
- **Vocabulary**: the 42 OECD Frascati minor fields in `disciplines.yaml`.
- **Validator** (`scripts/validate.ts` over `src/validate/`): schema, path, registry and time-zone rules, the curator-ownership rule diffed against a git base ref for automation authors, and link liveness as warnings with a bot-hostile-host allowlist. One line per finding, `path: rule: message`.
- **Seeds**: 15 institutions and 22 real, individually verified defenses from Dutch, Nordic and one American university, covering every state the site renders. Two research agents supplied 68 candidates; each seed's source page was fetched again before it was written, and every recording link was checked (YouTube via oEmbed, Panopto and Collegerama directly).
- **Site**: Astro for routing, collections and endpoints; React for every visible component. The `DefenseSchedule` island renders institution-local times at build time and switches to viewer-local times and live status after mount, with a test that hydrates the server markup and asserts no mismatch warnings.
- **Feeds and export**: a hand-written RFC 5545 serialiser, `feeds/all.ics`, one feed per discipline, and `api/defenses.json`, with `SEQUENCE` derived from per-file git commit counts.
- **CI**: a validation workflow for pull requests and a daily GitHub Pages deployment.

```
$ npx vitest run        Test Files 23 passed, Tests 156 passed
$ npm run validate      0 error(s), 0 warning(s)
$ npm run build         24 page(s) built
```

A fresh clone installs, typechecks, tests, validates and builds cleanly (task 8.1).

## What's left

Three tasks need a GitHub repository that does not exist yet: verifying the two workflows on a real pull request and deployment (7.1, 7.2), creating the repository itself (7.4), and subscribing to the deployed feed from a calendar app (8.2). Task 7.4 is flagged in the plan as needing the user's decision on repository name and visibility, so implementation paused there.

## Surprises

- **Astro 7.3.0 cannot build a site.** Its asset plugin injects `import ... from "astro/_internal/logger"`, which the package neither exports nor ships. Pinned to `~7.2.10`.
- **js-yaml 4 and 5 disagree about timestamps.** Astro parses frontmatter with js-yaml 4, which turns an unquoted `2026-09-15T12:30:00+02:00` into a `Date`; js-yaml 5 leaves it a string. The validator must see what the build sees, so the project pins js-yaml 4 and the schema rejects `Date` values with a "quote it" message.
- **Vitest leaks `BASE_URL=/` into child processes.** It mirrors `import.meta.env` into `process.env`, and an Astro build spawned from a test inherits that and silently drops the site base. The build-test helper strips those keys.
- **Two build tests in two files means two concurrent builds**, which collide on Astro's temp files. One file, one build.
- **TypeScript 7 is refused by `astro check`**; the language server asserts compatibility. Pinned to 5.x.
- **Locale quirks in `Intl`**: `en-GB` writes "Sept" and does not know "EDT"; `en-US` knows "EDT" but not "CEST". Dates are assembled from parts and zone abbreviations try both locales.
- **Real data is messier than fixtures.** Erasmus gives stream links only to the candidate; Utrecht hides some behind "click here"; Tampere says "link to be added"; two universities delete recordings by policy, which is exactly what `recording: { status: none }` is for.
