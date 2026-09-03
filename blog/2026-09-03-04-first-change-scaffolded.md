---
type: "Devlog Entry"
title: "First OpenSpec change: record-format-and-site, TypeScript throughout"
date: 2026-09-03
timestamp: 2026-09-03T12:31:21
tags: [architecture, documentation]
description: "Scaffolded and fully drafted the foundational OpenSpec change (proposal, five capability specs, design, 30 tasks) and fixed TypeScript as the only language for the project."
---

## What changed

The exploration from the [previous entries](2026-09-03-03-records-live-in-git.md) crystallised into the project's first OpenSpec change, `record-format-and-site`, scaffolded with `openspec new change` and drafted to completion:

```
openspec/changes/record-format-and-site/
  proposal.md
  design.md
  tasks.md                      # 8 groups, 30 checkbox tasks
  specs/defense-record/spec.md
  specs/university-registry/spec.md
  specs/defense-calendar/spec.md
  specs/defense-archive/spec.md
  specs/calendar-feeds/spec.md
```

`openspec validate record-format-and-site --strict` passes. No application code exists yet.

Mid-turn the user added a constraint: **TypeScript through and through**. It is now a fixed design context: schema, validator, site, feed serialiser, tests and all future scraper or submission tooling are TypeScript, with no shell logic beyond invoking npm scripts.

## Why it matters

This change is the seam every later change plugs into. The scraper change will emit the record format and inherit the curator-ownership rule; the submission change will target record files by their path-derived key. Getting the format and its enforcement right first means those later changes negotiate nothing.

## How it works

Decisions fixed in `design.md`, each with alternatives recorded:

- **Zod in TypeScript is the schema's source of truth**; JSON Schema files are generated from it and CI fails if they are stale. The site's content collections and the validator share the same objects, so format and enforcement cannot drift.
- **Astro** for the site, chosen over the already-installed Hugo precisely because Hugo would force Go templates and a second toolchain, contradicting the TypeScript constraint.
- **One validator run twice**: as a readable CI step producing `path: rule: message` lines, and implicitly inside the build.
- **Curator ownership enforced by diffing against the base branch** for pull-request authors in an automation allowlist, so the convention exists before the first scraper does.
- **OECD Frascati minor fields** (42 of them) as the discipline vocabulary, a real standard rather than an invented tag list.
- **Time stored twice** (offset plus IANA zone, validated against each other) and rendered in the browser; live and upcoming membership computed from the viewer's clock so a stale build is never wrong.
- **Hand-written iCalendar serialiser** with `SEQUENCE` derived from git commit count per file, so calendar clients update in place without anyone bumping a field.
- **GitHub Pages** from a daily scheduled build, single repository, real near-term seed defenses covering every rendered state.

## What's next

Run `/opsx:apply` on the change. Task 7.4 creates the public GitHub repository and is flagged to confirm name and visibility with the user first. The three open questions in the design (a second taxonomy level in the UI, the 30-day recording window, the domain name) are all deferrable without touching specs or tasks.

Two things sit outside the change's scope and are worth doing soon: recording the TypeScript-only convention and the stack in `openspec/config.yaml` so every future proposal is drafted against it, and `git init`, which task 1.1 covers.

## Surprises

`openspec validate` takes the change name as a positional argument, not `--change` as `status` and `instructions` do. Minor, but it cost one failed invocation.
