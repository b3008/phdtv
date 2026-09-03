---
type: "Devlog Entry"
title: "OpenSpec installed and initialized for Claude Code"
date: 2026-09-03
timestamp: 2026-09-03T11:04:11
tags: [infrastructure, architecture]
description: "Set up OpenSpec's spec-driven change workflow as the first tooling decision in an otherwise empty phdtv project."
---

## What changed

The `phdtv` directory was completely empty. This session installed [OpenSpec](https://github.com/Fission-AI/OpenSpec), a spec-driven development CLI, and initialized it for Claude Code:

- Upgraded the global install from 1.8.0 to 1.12.0 (`npm install -g @fission-ai/openspec@latest`).
- Ran `openspec init --tools claude --no-animation` non-interactively.

Generated files:

```
.claude/commands/opsx/{apply,archive,explore,propose,sync}.md
.claude/skills/openspec-{apply-change,archive-change,explore,propose,sync-specs}/SKILL.md
openspec/config.yaml          # schema: spec-driven
openspec/specs/.gitkeep
openspec/changes/archive/.gitkeep
```

`openspec list` and `openspec validate --all` both run clean against the fresh project (no changes, nothing to validate).

## Why it matters

Starting with OpenSpec means every feature in `phdtv` begins as a written proposal, spec delta, and task list before code exists. For a project with no code yet, that puts the design conversation first and gives later sessions (human or AI) a durable record of *why* each capability was built, not just the diff.

## How it works

OpenSpec's workflow runs through slash commands installed into `.claude/commands/opsx/`:

1. `/opsx:propose "idea"` — drafts `openspec/changes/<name>/` with a proposal, design notes, spec deltas, and tasks.
2. `/opsx:apply` — implements the tasks from the change folder.
3. `/opsx:sync` — merges spec deltas into the canonical `openspec/specs/`.
4. `/opsx:archive` — moves the completed change into `openspec/changes/archive/`.

`openspec/config.yaml` can carry project context (tech stack, conventions) and per-artifact rules that get injected when the AI drafts those documents. It is currently all commented-out defaults.

## What's next

- Decide what `phdtv` actually is and fill in `openspec/config.yaml` with the tech stack and conventions.
- `git init` so OpenSpec artifacts and this devlog get committed.
- First real change: `/opsx:propose` for the project's initial capability.

## Surprises

The user's zsh profile wraps `node` and `npm` in nvm lazy-load functions that depend on `_nvm_lazy_load`. In Claude Code's non-interactive shell that helper is undefined, so calling `node` recursed until zsh's `FUNCNEST` limit tripped. Calling `/opt/homebrew/bin/npm` and `/opt/homebrew/bin/openspec` by full path sidestepped it. Recorded in `.devlog/learned.md` so future sessions don't rediscover it.

OpenSpec also flagged four stale global Codex prompts under `~/.codex/prompts/opsx-*.md` from an older install. It deferred removing them until matching Codex skills exist, so nothing outside this project was touched.
