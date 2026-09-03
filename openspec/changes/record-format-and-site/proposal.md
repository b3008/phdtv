## Why

Free, public livestreams of PhD defenses exist in large numbers, especially in countries where a defense is a legally public ceremony, but they are scattered across dozens of university agenda pages and nobody aggregates them. PhD TV needs a foundation before scraping or public submissions can exist: one record format that every sourcing channel shares, and a site that turns those records into a calendar, an archive and subscribable feeds.

## What Changes

- Introduce the **defense record** format: one Markdown file per defense under `records/`, with structured frontmatter validated against a JSON schema. The filename is the deduplication key. Records carry a status lifecycle (`unverified`, `published`, `hidden`), provenance (`source` block) and a `verified_by` marker.
- Establish the **field ownership convention**: automated writers may only fill fields that are still empty and their own `source` block; once a record is verified, automation proposes but never overwrites.
- Introduce the **university registry**: one YAML file per institution under `universities/`, carrying name, country, timezone and agenda URL. Records reference institutions by slug.
- Introduce **continuous validation** on every pull request: schema conformance, referential integrity to the registry, timezone sanity, and link liveness as a warning.
- Introduce the **static site**: an upcoming calendar with viewer-local times, a "live now" strip computed in the browser, an archive of past defenses that says plainly when no recording exists, and one page per defense.
- Introduce **feeds**: an `.ics` calendar for all defenses and one per discipline, plus a JSON export of published records.
- Seed the repository with a **hand-curated set of real defenses** covering every state the site must render: upcoming with stream, upcoming without stream yet, past with recording, past without recording.
- Turn the project into a **git repository** hosted on GitHub, since pull requests are the moderation queue for later changes.

Out of scope for this change: scrapers, the submission path, any server-side component. Each is a later change built on this foundation.

## Capabilities

### New Capabilities

- `defense-record`: the file format, required and optional fields, status lifecycle, provenance, field ownership and validation rules for a single defense.
- `university-registry`: the institution registry that records reference, and the integrity rules between the two.
- `defense-calendar`: the upcoming and live views of the site, including viewer-local time rendering.
- `defense-archive`: the past-defense views, recording availability and honest handling of unrecorded defenses.
- `calendar-feeds`: `.ics` subscriptions and the JSON export derived from published records.

### Modified Capabilities

None. This is the first change in the project.

## Impact

- **Codebase**: greenfield. Creates `records/`, `universities/`, `schema/`, the site source, and CI workflows.
- **Dependencies**: Node.js, a static site generator (Astro proposed in design), a JSON Schema validator, GitHub Actions for validation and scheduled rebuilds, static hosting (GitHub Pages or equivalent).
- **Operations**: none beyond a scheduled rebuild so date-relative views stay fresh.
- **Later changes depend on this one**: the scraper change will emit this record format and rely on the field ownership convention; the submission change will target existing record files by their key.
