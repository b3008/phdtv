---
type: "Devlog Entry"
title: "Public repository and first deployment"
date: 2026-09-05
timestamp: 2026-09-05T15:10:11
tags: [infrastructure, demo]
description: "The project moved from a local-only repository to github.com/b3008/phdtv; the validate and deploy workflows passed on the first push and the site, feeds and export are live at b3008.github.io/phdtv."
---

## What changed

The user asked for a public GitHub repository named `phdtv`. It was created from the working directory with the GitHub CLI, `main` pushed, and GitHub Pages switched to deploy from Actions. The push triggered both workflows. Both passed on the first attempt, and the site has been live since 12:08 UTC.

```
$ gh repo create phdtv --public --source=. --remote=origin --push
 * [new branch]      HEAD -> main
$ gh api -X POST repos/b3008/phdtv/pages -f build_type=workflow

Validate  push  success   validate 23 s
Deploy    push  success   build 12 s, deploy 11 s
```

## Why it matters

Until now every claim in this log about "the site" was about a directory on one laptop. The two open threads that had been carried since the [first build](2026-09-03-06-record-format-and-site-built.md), create the repository and see the workflows run for real, are closed. The site's URL, `https://b3008.github.io/phdtv/`, is the one the build had been assuming all along, because the owner turned out to be the same account that seeded the records as `verified_by: b3008`.

It also validates yesterday's bet that the deploy workflow could stay unchanged when [Astro was replaced](2026-09-05-02-no-astro.md): it sets the site URL and base path from the repository name and runs `npm run build`, and that was enough.

## How it works

Nothing new was written for this; it is the existing pieces meeting the real service for the first time. Probing the deployment from the terminal:

```
200 text/html; charset=utf-8  /
200 text/html; charset=utf-8  /archive/
200 text/calendar             /feeds/all.ics
200 text/calendar             /feeds/law.ics
200 application/json          /api/defenses.json
200 text/html; charset=utf-8  /defenses/2026/2026-09-15-utrecht-chris-ten-dam/

assets referenced by the front page: 3, all 200
events in feeds/all.ics: 17   (upcoming, plus defenses that ended in the last 30 days)
defenses in api/defenses.json: 22, with absolute page URLs
```

The whole build job, checkout with full history through `npm ci`, validation and the build, took twelve seconds on the runner; the site build itself is a fraction of that. Full history matters because the feed's SEQUENCE numbers are per-file commit counts, and the workflow's `fetch-depth: 0` is what makes them right on the runner.

## What's next

- Subscribe to `feeds/all.ics` from a calendar application, edit one record, and confirm the event updates in place rather than duplicating. That is the last unverified promise of the feed design.
- The validate workflow has run on a push but not yet on a pull request, which is the path that exercises the curator-ownership rule against a base branch.
- Then the work the repository exists for: scrapers opening pull requests, and a submission path for people who are not curators.

## Surprises

- Pages was enabled a few seconds *after* the push that triggered the deploy. The deploy job started twenty seconds later and found Pages ready, so the race was won, but it was a race; the safe order is to enable Pages before the first push.
- A `.astro/` directory keeps reappearing in the working copy with generated content types. It is an editor extension reacting to the project, not anything in the repository, and since Astro left the ignore file it shows as untracked.
