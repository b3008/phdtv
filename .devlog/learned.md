# Project knowledge — phdtv

## Glossary

- **OpenSpec** — spec-driven development CLI (`@fission-ai/openspec`). Changes live in `openspec/changes/<name>/`, archived to `openspec/changes/archive/`, and specs in `openspec/specs/`. Config in `openspec/config.yaml` (schema: `spec-driven`).
- **opsx** — the slash-command namespace OpenSpec installs into `.claude/commands/opsx/`: `propose`, `explore`, `apply`, `sync`, `archive`.

- **Defense record** — the single schema every sourcing channel (scraper, submission form, curator) emits and edits. Carries provenance (source, last-seen, verified-by) and a status (unverified / published / hidden). Natural key: university + date + normalized candidate name.
- **Sourcing channels** — scraping university agenda pages, submissions from candidates or others, and direct curation. Curation is the review layer that the other two feed, not a parallel source.

- **Field ownership convention** — scrapers may write only the `source` block and fields that are still `null`; once `verified_by` is set they propose via PR but never overwrite curator edits.

- **Disciplines vocabulary** — `disciplines.yaml`, the 42 OECD Frascati minor fields as slugs with major-field parents; the only allowed values for a record's `disciplines`.
- **Recording states** — available (url), none (explicit `recording.status: none`), not-yet-available (no info, ended < 30 days ago), no-recording-known (no info, older).

## Entities

- `openspec/changes/record-format-and-site/` — the foundational change: record format, registry, validator, Astro site, feeds, seeds, CI. Everything later builds on it.
- `src/schema/record.ts`, `src/schema/university.ts` — Zod schemas, the single source of truth; `schema/*.schema.json` are generated from them (planned).
- `scripts/validate.ts` — the one validator; prints `path: rule: message`, blocking vs warning (planned).
- `automation.json` — allowlist of GitHub logins whose PRs are subject to the curator-ownership rule (planned, empty until the scraper change).

- `records/YYYY/YYYY-MM-DD-<university>-<candidate-slug>.md` — one defense per file; the filename is the dedupe key (proposed, not yet built).
- `universities/<slug>.yaml` — registry of name, country, timezone, agenda URL, scraper adapter id (proposed).
- `schema/record.schema.json` — the contract validated in CI on every PR (proposed).

- `openspec/config.yaml` — project context and per-artifact rules shown to AI when drafting proposals/specs/tasks. Currently all commented-out defaults; fill in tech stack once the project has one.

## Recurring themes

- **TypeScript through and through** (user constraint, 2026-09-03): schema, validator, site, feeds, tests, future scrapers and submission tooling. No shell logic beyond npm script invocation, no second language. This is why Astro beat the already-installed Hugo.
- **React for every UI component** (user constraint, 2026-09-03): anything that renders markup is a React `.tsx` under `src/components/`; Astro is confined to `src/pages/` for routing, collection loading, endpoints and the document shell. No `.astro` components.
- **Stack**: Astro + React integration, content collections + Zod, Vitest + React Testing Library under jsdom, Node 24 LTS with native type stripping, GitHub Actions for validation and daily Pages deploys, single repository.
- **OpenSpec CLI quirk**: `openspec validate <change>` is positional; `status` and `instructions` take `--change`.

- **Shell gotcha:** the user's zsh profile defines `node`/`npm` as nvm lazy-load wrapper functions that call `_nvm_lazy_load`. In non-interactive Claude Code shells that function is undefined, so `node`/`npm` recurse until `FUNCNEST` is hit. Call binaries by full path (`/opt/homebrew/bin/node`, `/opt/homebrew/bin/npm`, `/opt/homebrew/bin/openspec`) instead.

## Open threads

- `record-format-and-site` is fully planned and validated; next step is `/opsx:apply`. Task 7.4 (create public GitHub repo) needs the user to confirm name and visibility.
- Deferred design questions: second taxonomy level in the UI, the 30-day recording window, the site domain name (must be settled before feeds are announced).
- GitHub issue forms as the first submission path is still only a proposed default for the later submissions change.
- Which universities to seed the first scraper with (Dutch agendas are the candidate, unconfirmed).
- Project is not yet a git repository; devlog entries and OpenSpec artifacts are uncommitted until `git init`.
- `openspec/config.yaml` has no project context yet; the stack and the TypeScript-only convention are now known and should be recorded there so future proposals are drafted against them.
