---
type: "Devlog Entry"
title: "PhD TV: the git repo is the database"
date: 2026-09-03
timestamp: 2026-09-03T12:15:06
tags: [architecture]
description: "Decided that defense records live as one Markdown file each in a git repository, with pull requests as the moderation queue and a static site built from them."
---

## What changed

Still no code. The second explore turn settled the storage question raised in the [previous entry](2026-09-03-02-sourcing-all-three-channels.md): **defense records live in a git repo**, not in a database behind an admin panel.

## Why it matters

With records as files, the three sourcing channels collapse into git operations. Scrapers open pull requests. A submission form becomes a file and a pull request via an action. The curator edits files directly. The review queue is the PR list, and a scraper's PR is a readable diff of one small file, which is a better moderation UI than anything worth building for a single curator.

Other things that fall out for free: full edit history per defense, recordings attached later as a plain commit to the same file, takedowns as `status: hidden`, and a downloadable dataset as a by-product of the build.

## How it works

Proposed layout, not yet built:

```
records/2026/2026-09-15-tudelft-jane-doe.md   # filename is the natural key
universities/tudelft.yaml                      # registry: name, country, tz, agenda URL
schema/record.schema.json                      # contract every channel validates against
```

Each record is Markdown with structured frontmatter (candidate, title, university slug, disciplines, `starts_at` with offset plus an explicit IANA `timezone`, stream and recording blocks, `status`, a `source` block with channel, URL and last-seen, and `verified_by`) and a free-text body for the abstract. CI validates the schema and checks link liveness on every PR.

Two conventions surfaced that need writing down early:

- **Scrapers own only the `source` block and fields still `null`.** Once `verified_by` is set, a scraper proposes but never overwrites, so a re-scrape cannot undo a curator's fix.
- **Submissions start as GitHub issue forms.** Zero backend, but submitters need a GitHub account. A public form plus one small function that opens the PR is the upgrade path when that wall bites.

Proposed defaults still open to challenge: single repo to start (split `records/` out later if bot PRs drown code PRs), Astro for the site because content collections make the schema executable at build time, though Hugo is already installed and would work with a separate validation script.

## What's next

Offered to scaffold the first OpenSpec change, `record-format-and-site`: the record format and schema, CI validation, the universities registry, a static site with calendar, archive and `.ics` feeds, and a handful of hand-curated real defenses. Scrapers and submissions would each be a later change. Waiting on the user's yes or no.

Still open: the exact field list, a discipline taxonomy, and which universities to hand-curate first.

## Surprises

The awkward part of the git model is not submissions, which have an obvious zero-backend workaround. It is bots and humans editing the same file. The fix is a field-ownership convention rather than any tooling, which is cheap only if it is decided before the first scraper exists.
