## 1. Repository and toolchain

- [x] 1.1 Initialise the git repository with `.gitignore`, `.nvmrc` pinned to Node 24 LTS and a README stub; verify `git status` shows a clean initial commit containing the OpenSpec and devlog directories
- [x] 1.2 Create `package.json` with Astro, the Astro React integration, React, Zod, Vitest, React Testing Library and jsdom, plus a strict `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `jsx: react-jsx`); verify `npm install`, `npm run typecheck` and `npm run build` succeed on an empty site whose index page renders one React component
- [x] 1.3 Spike the content-layer glob loader reading a placeholder record from `records/` at the repository root; verify the placeholder renders on a page and hot reload picks up an edit, then delete the placeholder

## 2. Schema and vocabulary

- [x] 2.1 Write `disciplines.yaml` with the 42 OECD Frascati minor fields as slugs, display names and major-field parents; verify a test asserts 42 entries with unique slugs and valid parents
- [x] 2.2 Implement the university Zod schema in `src/schema/university.ts` (slug, name, ISO 3166-1 alpha-2 country, IANA timezone, optional website, agenda_url, aliases); verify unit tests cover a valid entry and each missing or malformed required field
- [x] 2.3 Implement the record Zod schema in `src/schema/record.ts` with strict keys and refinements for offset-matches-timezone, published-requires-verified_by, scraped-requires-source.url, submitted-requires-submitted_at, recording as url-or-status-none, disciplines from the vocabulary and BCP 47 language; verify a unit test per refinement passes on a valid record and fails with a named field on an invalid one
- [x] 2.4 Add `scripts/schema.ts` that emits `schema/record.schema.json` and `schema/university.schema.json` from the Zod objects, plus an `npm run schema:check` mode; verify the check passes after generation and fails when a committed JSON file is edited by hand

## 3. Validator

- [x] 3.1 Implement `scripts/validate.ts` core: load all records and registry files, run the schemas, print `path: rule: message` per finding, exit non-zero on blocking findings; verify fixture records under `test/fixtures/` produce the expected finding lines in a Vitest snapshot
- [x] 3.2 Add cross-file rules: record path must match frontmatter date, university and candidate slug; `university` must exist in the registry; record timezone differing from registry timezone emits a warning; verify one fixture per rule yields the expected finding and the warning does not affect the exit code
- [x] 3.3 Add the curator-ownership rule: given a base commit and an author login, for records that had `verified_by` in base, a non-empty non-`source` field changed by an author listed in `automation.json` is a blocking finding; verify tests using a temporary git repository fixture cover automation-changes-protected-field (fails), automation-fills-empty-field (passes) and human-changes-protected-field (passes)
- [x] 3.4 Add link liveness as warnings: HEAD with timeout, GET-with-range fallback, allowlist of bot-hostile hosts counted reachable on any response, skip entirely when offline; verify tests with a mocked fetch cover reachable, unreachable and allowlisted hosts and that no case changes the exit code
- [ ] 3.5 Wire `npm run validate` with `--base <ref>` and `--author <login>` flags; verify running it against the seeded `records/` passes with zero blocking findings

## 4. Seed data

- [ ] 4.1 Add registry files under `universities/` for every institution used by the seeds; verify `npm run validate` passes and each file has a website
- [ ] 4.2 Add at least ten real, hand-verified curated records under `records/` spread over the coming month and past weeks, covering upcoming-with-stream, upcoming-without-stream, past-with-recording, past-with-`recording.status: none`, past-recent-without-recording and past-old-without-recording; verify `npm run validate` passes and a test asserts every listed state is present in `records/`

## 5. Site

- [ ] 5.1 Define content collections for records, universities and disciplines using the schemas from group 2, with the glob loader bases from task 1.3; verify `npm run build` fails when a seed record is deliberately broken and passes when restored
- [ ] 5.2 Implement `src/lib/time.ts` (zone offset at instant, viewer-local and institution-local formatting, live window with 90-minute default, upcoming/past classification) and `src/lib/recording.ts` (available, none, not-yet-available under 30 days, no-recording-known); verify unit tests cover each branch including a daylight-saving boundary
- [ ] 5.3 Build the layout chrome and the defense detail page body as React components under `src/components/`, mounted from a thin Astro page at a URL derived from the record path, rendering every present field, institution name, country and website link, and source attribution when `source.url` is set; verify a React Testing Library test renders a seed record with each field and the attribution, and the built HTML contains them
- [ ] 5.4 Build the upcoming view as React components (day-grouped list, defense card, empty state, stream-link-or-not-announced states, discipline and institution filters reflected in the query string); verify component tests cover the empty state and both filters, and the built HTML lists only published future seeds
- [ ] 5.5 Implement the `DefenseSchedule` React island hydrated with `client:load`: renders institution-local times at build time, then after mount switches to viewer-local times with institution time alongside and recomputes upcoming and live membership from `Date.now()`; verify a React Testing Library test with a fixture starting within the last hour shows it as live after mount, the pre-mount render matches the build-time markup (no hydration mismatch), and the built no-script HTML shows the institution time and zone name
- [ ] 5.6 Build the archive view as React components with descending order, the four recording states, the shared filters and a recordings-only filter; verify a component test renders one fixture per recording state with the right label and the built HTML shows each label for the corresponding seed

## 6. Feeds and export

- [ ] 6.1 Implement `src/lib/ics.ts`: RFC 5545 serialisation with 75-octet line folding, text escaping, UTC `DTSTART`, `DURATION`, `UID`, `SEQUENCE`, `DTSTAMP`, `SUMMARY`, `DESCRIPTION`, `LOCATION`, `URL`; verify unit tests cover folding of a long description, escaping of commas and newlines, and a round-trip through an iCalendar parser
- [ ] 6.2 Implement `src/lib/git-meta.ts` that reads commit count and last commit date per record file from one `git log` invocation and throws when the checkout is shallow; verify a test on a temporary repository returns increasing sequence after a second commit and the shallow case throws
- [ ] 6.3 Add the `feeds/all.ics` and `feeds/[discipline].ics` static endpoints containing published defenses that are upcoming or ended within 30 days; verify a test parses the built feeds, finds no hidden or unverified seed, and finds only matching disciplines in a per-discipline feed
- [ ] 6.4 Add the `api/defenses.json` endpoint with `schemaVersion`, `generatedAt`, resolved institution name and page URL per record; verify a test parses the built file, checks `schemaVersion === 1` and confirms hidden and unverified seeds are absent

## 7. Continuous integration and deployment

- [ ] 7.1 Add `.github/workflows/validate.yml` running typecheck, tests, `schema:check` and `validate --base <pr base> --author <pr author>` on pull requests touching `records/`, `universities/`, `disciplines.yaml`, `schema/` or `src/`; verify a throwaway pull request with an invalid record fails the check with the file and rule in the log
- [ ] 7.2 Add `.github/workflows/deploy.yml` on push to `main` and a daily schedule, with full-depth checkout, building and publishing to GitHub Pages; verify the site, `feeds/all.ics` and `api/defenses.json` are reachable at the Pages URL after the first run
- [ ] 7.3 Write the README: what the project is, the record format with an annotated example, how to add or correct a record by pull request, the takedown path via `status: hidden`, and the automation ownership convention; verify every relative link in it resolves
- [ ] 7.4 Create the GitHub repository and push `main`, enabling Pages from the workflow (confirm the repository name and visibility with the user before creating it); verify `gh repo view` shows the repository and the first deploy workflow run succeeds

## 8. Verification

- [ ] 8.1 From a fresh clone run `npm ci`, `npm run typecheck`, `npm test`, `npm run schema:check`, `npm run validate` and `npm run build`; verify all succeed and the build output contains a page per published seed, both feed kinds and the JSON export
- [ ] 8.2 Subscribe to the deployed `feeds/all.ics` in a calendar application and add a stream link to one seed by pull request; verify the event appears at the correct local time and updates in place rather than duplicating after the next deploy
