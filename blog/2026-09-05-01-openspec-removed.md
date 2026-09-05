---
type: "Devlog Entry"
title: "OpenSpec removed"
date: 2026-09-05
timestamp: 2026-09-05T12:51:36
tags: [architecture, infrastructure]
description: "At the user's request the OpenSpec planning layer was deleted from the repository; the specs it held survive in git history, the README, the tests and the code."
---

## What changed

The user asked to remove OpenSpec from the project. Deleted in one commit:

- `openspec/`: the config, the empty main specs directory, and the change `record-format-and-site` with its proposal, five capability specs, design and task list.
- `.claude/`: the five `/opsx:*` commands and five skills that `openspec init` had installed. Nothing else lived there.
- The README line pointing at `openspec/`.

The artifacts last exist at commit `d884bb0`. The global `openspec` CLI on the machine was left alone; only the project was touched.

## Why it matters

OpenSpec did its job for the two days it was here: the exploration conversation turned into a proposal, five specs, a design with twelve recorded decisions, and a thirty-task plan that was executed almost to the end. Removing it changes how the next change gets planned, not what was built. The behaviour the specs described is now enforced by the tests and documented in the README, which is where a contributor would look anyway.

## How it works

The remaining work from the plan, all of it needing a GitHub repository, moved into the open threads of `.devlog/learned.md`: create the repository once the name and visibility are confirmed, verify the validate and deploy workflows on a real pull request and deployment, and subscribe to the deployed feed from a calendar app. The OpenSpec vocabulary and the CLI quirk moved from the notebook to `.devlog/archive/openspec.md`.

## What's next

Same as before the removal: the GitHub repository. Later changes such as the scraper and the submission path will be planned in whatever form the user prefers; the record format and the curator-ownership rule they depend on are unchanged.
