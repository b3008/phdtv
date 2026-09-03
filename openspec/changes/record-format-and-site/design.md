## Context

Greenfield: the directory holds only OpenSpec scaffolding and a devlog, and is not yet a git repository. Decisions already made in exploration and fixed by this design:

- Defenses arrive through three channels (scraped, submitted, curated); curation is the review layer the other two feed.
- Records live in the git repository as files; pull requests are the moderation queue; the site is built statically from the merged tree.
- A single curator for the foreseeable future, who wants to run no servers.
- **TypeScript through and through**: schema, validation, site, feed generation, tests, and any future scraper or submission tooling are written in TypeScript. No shell-script logic beyond invoking `npm` scripts; no second language.
- **React for every UI component**: anything that renders markup is a React component in a `.tsx` file. No `.astro` components, no template partials in another syntax.

Requirements are in the five specs under `specs/`; this document only covers how to meet them.

## Goals / Non-Goals

**Goals:**
- One executable source of truth for the record schema that both the build and the validator use, so the format cannot drift from its enforcement.
- Validation that produces a readable failure per file per rule, because pull-request review is the whole moderation experience.
- A site that is correct about time regardless of when it was built.
- Everything runs in GitHub Actions on a free tier with no secrets beyond the default token.

**Non-Goals:**
- Scraper adapters, the submission path, search, accounts, comments, analytics.
- A design system or visual polish beyond a clean readable layout; that is a later change once the data proves itself.
- Historical backfill. Seeds are a handful of real defenses, not an archive.

## Decisions

### D1. Zod schema in TypeScript is the source of truth; JSON Schema is generated from it
`src/schema/record.ts` and `src/schema/university.ts` define the shapes with Zod, including refinements for the cross-field rules (offset matches time zone, published requires `verified_by`, scraped requires `source.url`). The site's content collections consume these schemas directly at build time. A script emits `schema/record.schema.json` and `schema/university.schema.json` from the same Zod objects for editor autocompletion and for non-TypeScript consumers; CI fails if the committed JSON Schema is stale.

*Alternatives:* JSON Schema as source with generated TypeScript types. Rejected: the site needs Zod objects anyway, and two hand-maintained artifacts drift. Plain TypeScript types with no runtime validation. Rejected: records are data written by bots and strangers; runtime validation is the point.

### D2. Astro for routing, collections and endpoints; React for every UI component
The site is Astro (TypeScript-native, static output, content collections validated by Zod) with the React integration. `records/`, `universities/` and `disciplines.yaml` stay at the repository root so the tree reads as a dataset, and the collections use a glob loader with a base path pointing at them.

The division of labour is strict. Astro owns `src/pages/`: file-based routing, loading collections, static `.ics` and `.json` endpoints, and the HTML document shell. Every visible component lives under `src/components/` as a React `.tsx` file: the layout chrome, the defense card, the day-grouped lists, the detail page body, filters, and the schedule island. An Astro page is at most a data-loading header plus one `<Page {...props} />` element. Components that need the viewer's clock or input are hydrated with a `client:` directive; everything else is rendered to static HTML by React at build time and ships no JavaScript.

*Alternatives:* Next.js with static export is React end to end, but it has no content-collection equivalent, so typed Markdown loading and the schema-at-build guarantee would be hand-rolled, and its static export has been the less-maintained path for years. Hugo is already installed on the development machine and is fast, but it is Go-templated, has no typed frontmatter validation, and would force a second language for tooling, which contradicts the TypeScript-only constraint. Eleventy is JavaScript-first with weaker typing. A hand-rolled generator reinvents routing, asset handling and collections.

### D3. One validator, run twice
`scripts/validate.ts` loads every record and registry file, runs the Zod schemas, then the cross-file checks: path matches frontmatter, institution exists, record time zone versus registry time zone (warning), curator-ownership check (D5), and link liveness (warning). It prints one line per finding as `path: rule: message` and exits non-zero on any blocking finding. CI runs it as its own step so failures are readable in the pull request; the Astro build runs the Zod part again implicitly, which is fine because it can no longer fail once the validator has passed.

The offset check uses `Intl.DateTimeFormat` with `timeZoneName: 'longOffset'` to compute the zone's offset at the given instant; no date library is needed for that.

Link liveness issues a `HEAD` request with a short timeout, falls back to `GET` with a range header, and treats known bot-hostile hosts (YouTube, Zoom) as reachable if they return any HTTP response at all. Findings are warnings only, per spec.

### D4. Controlled discipline vocabulary from the OECD Fields of Research and Development
`disciplines.yaml` lists the 42 minor fields of the OECD Frascati classification as slugs with display names and their major-field parent. It is a real standard universities and statistics offices already use, it is small enough to browse, and it gives per-discipline feeds a stable set of URLs. The schema validates `disciplines` against this file at build time.

*Alternatives:* free-text tags (unfilterable), Wikipedia categories (unbounded), inventing our own (nobody else's data maps to it).

### D5. Curator ownership enforced in CI by diffing against the base branch
On pull requests, the validator receives the base commit. For each record present in both base and head where base has `verified_by` set, it compares frontmatter field by field. If the pull-request author is in the automation allowlist (a list of GitHub logins in `automation.json`, initially empty until the scraper change adds one), any changed field that was non-empty in base, other than the `source` object, is a blocking finding. Human authors are exempt. This makes the convention real before the first scraper exists, so the scraper change inherits it rather than negotiating it.

*Alternative:* a CODEOWNERS or branch-protection approach. Rejected: those act at file granularity, and the rule is field-level.

### D6. Time is stored twice and rendered in the browser
Records carry `starts_at` with an explicit offset and an IANA `timezone`, both validated against each other. The `<DefenseSchedule>` React component receives the list of published defenses as props. At build time React renders it with the institution-local time and zone name, which is the no-script fallback in the HTML. In the browser the same component is hydrated with `client:load`; on mount it reads `Date.now()` and the viewer's zone, then re-renders with viewer-local times, institution time alongside, and recomputed upcoming and live membership. So a stale build never shows a finished defense as upcoming, and the markup with and without scripting comes from one component rather than two templates. A scheduled workflow rebuilds daily so the no-script fallback is at most a day old.

Hydration mismatch is avoided by rendering the build-time view on the first client render as well, and switching to viewer-local values in an effect.

*Alternative:* server-side rendering on demand. Rejected: requires a server, contradicts the zero-operations goal.

### D7. Feeds are Astro endpoints with a hand-written iCalendar serializer
`src/pages/feeds/all.ics.ts` and `src/pages/feeds/[discipline].ics.ts` are static endpoints. `src/lib/ics.ts` serializes events per RFC 5545 with line folding and text escaping, emits `DTSTART` in UTC to avoid `VTIMEZONE` blocks, and puts the institution-local time in the description text. It is about a hundred lines and fully unit-tested.

`SEQUENCE` and `DTSTAMP` come from git: the number of commits touching the record file and the date of the latest one, read once per build through a single `git log` invocation. This makes `SEQUENCE` monotonic without asking curators to bump a field by hand. The build workflow therefore checks out with full history.

*Alternatives:* the `ics` npm package (fine, but hides `SEQUENCE` handling and adds a dependency for a small format); a content hash for `SEQUENCE` (not monotonic, breaks updates in calendar clients).

### D8. JSON export is a static endpoint with a schema version
`src/pages/api/defenses.json.ts` emits every published record with resolved institution name and page URL under `{ schemaVersion: 1, generatedAt, defenses: [...] }`. `schemaVersion` bumps only on breaking field changes.

### D9. Tooling: Node LTS, native TypeScript execution, Vitest, strict compiler options
Scripts run through Node's built-in TypeScript type stripping (Node 22.18+ / 24 LTS), so there is no transpile step for tooling; `.nvmrc` pins the version and CI uses the same. `tsconfig.json` enables `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and `jsx: react-jsx` so record handling cannot silently treat a missing field as present. Vitest covers the schema refinements, the validator rules against fixture records, the time helpers, and the iCalendar serializer; React components are tested with React Testing Library under jsdom, asserting on rendered text and roles rather than markup. There is no end-to-end browser test in this change.

### D10. Hosting on GitHub Pages from a build workflow
Two workflows: `validate.yml` runs on every pull request touching `records/`, `universities/`, `disciplines.yaml`, `schema/` or `src/`; `deploy.yml` runs on push to `main` and on a daily schedule, builds the site and publishes it to GitHub Pages. Same platform as the pull-request queue, no secrets, free.

*Alternative:* Cloudflare Pages. Equivalent, adds an account and a token; revisit if Pages limits bite.

### D11. Single repository
Records, registry, site and workflows live together. If automated pull requests ever crowd out code review, `records/` and `universities/` move to a dataset repository and the site consumes them as a submodule or a build-time fetch. That split is cheap later and premature now.

### D12. Seed records are real, near-term and hand-verified
The seed set is at least ten real defenses drawn from public university agendas, chosen to cover every rendered state: upcoming with stream, upcoming without stream yet, live-window testing via one whose time is adjusted in a fixture only, past with recording, past with `recording.status: none`, past recent without recording, past old without recording. All seeds are `source.channel: curated` with `verified_by` set. Fixture records used only by tests live under `test/fixtures/` and never in `records/`.

## Risks / Trade-offs

- [Offset check rejects a correct record because a source page lied about the time] → The failure message states the expected offset for that zone and instant; the curator fixes one character. Accepted.
- [Link liveness flakes on bot-hostile video platforms] → Warnings only, host allowlist treats any HTTP response as reachable, and the check is skipped when the network is unavailable.
- [Stale build shows wrong upcoming or live state to no-script viewers] → Daily rebuild bounds staleness to one day; scripted viewers are always correct.
- [`SEQUENCE` from commit count breaks if history is rewritten or the checkout is shallow] → Build workflow uses full-depth checkout; a shallow checkout fails the build loudly rather than emitting `SEQUENCE: 0`.
- [Seeds go stale within weeks] → They are supposed to; they become archive entries, which exercises that view for free. Pick seeds spread over the coming month.
- [Personal data of candidates] → Names are already public on institutional agendas. `status: hidden` is the takedown path, documented in the README, and takes one commit.
- [Astro glob loader reading outside `src/` may need care with hot reload and path bases] → Supported in Astro 5's content layer; verify in the first task before building on it.

## Migration Plan

Greenfield, so no migration. Deployment is the first successful run of `deploy.yml` after Pages is enabled on the repository. Rollback is reverting a commit; the next scheduled or push-triggered build republishes the previous state.

## Open Questions

- Whether the discipline vocabulary needs the six OECD major fields as a browsable second level in the UI. Does not affect the schema, which already stores the parent.
- The exact "not yet available" window for recordings. Specified as 30 days; a constant that can change without touching the format.
- The site's domain name. Pages serves a default URL until one is chosen; feeds must use whatever is final, so decide before announcing the site.
