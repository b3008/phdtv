# OpenSpec (used 2026-09-03, removed 2026-09-05)

The project was planned and built through OpenSpec's `/opsx:explore` and `/opsx:apply` on 2026-09-03, then the user asked for OpenSpec to be removed. The change artifacts (proposal, five capability specs, design, tasks) last exist at commit d884bb0 under `openspec/changes/record-format-and-site/`. The specs' substance lives on in the README, the tests and the code.

Lines removed from learned.md:

- **OpenSpec** — spec-driven development CLI (`@fission-ai/openspec`). Changes live in `openspec/changes/<name>/`, archived to `openspec/changes/archive/`, and specs in `openspec/specs/`. Config in `openspec/config.yaml` (schema: `spec-driven`).
- **opsx** — the slash-command namespace OpenSpec installs into `.claude/commands/opsx/`: `propose`, `explore`, `apply`, `sync`, `archive`.
- **OpenSpec CLI quirk**: `openspec validate <change>` is positional; `status` and `instructions` take `--change`.
- `openspec/changes/record-format-and-site/` — the foundational change: record format, registry, validator, Astro site, feeds, seeds, CI. Everything later builds on it.
- `record-format-and-site`: 26/30 tasks done. Remaining 7.1/7.2 verification, 7.4 and 8.2 all need a GitHub repository; waiting for the user to confirm repository name and visibility (defaults assumed in `astro.config.ts`: owner `b3008`, base `/phdtv`).
- `openspec/config.yaml` has no project context yet; the stack and the TypeScript-only convention are now known and should be recorded there so future proposals are drafted against them.
