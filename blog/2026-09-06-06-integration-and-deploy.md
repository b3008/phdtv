---
type: "Devlog Entry"
title: "Three branches become one main, and the redesign goes live"
date: 2026-09-06
timestamp: 2026-09-06T21:37:00
tags: [infrastructure, architecture]
description: "The calendar redesign, the centerfold pages, the about page and the Storybook were merged into main with the repository's first merge commits and pushed, so phdtv.net now wears the print TV-guide look with the calendar and two feature pages."
---

## What changed

On the user's "perform the integration", the day's parallel work was folded into `main`, and on "deploy to vps" it was pushed, which is what deploys it:

- `7d68ddc` merges `calendar-views`, seventeen commits that rewrite the shell, the stylesheet, the page functions and the generator. The about page had reached `main` in the meantime, so its link joins the new masthead navigation (marked current on its own page) and the footer, its route and registry data stay in the generator, and its page sits in the shared column.
- `3aaed64` merges `centerfold`, eight commits already rebased onto the finished calendar branch. The about page's route, test and README bullet stay beside the new ones.
- `df797b6` renumbers the day's devlog entries by timestamp. Three sessions had each picked index 02; the about page keeps it, the centerfolds become 03 and the calendar landing 04, media folders and references included.
- The Storybook branch from a fourth session was fast-forwarded on top by that session, then the whole of `main` was pushed: 42 commits, the first since the move to the VPS.

The Deploy workflow validated, built and rsynced the site; the Validate workflow passed alongside it. Every route was then checked live: the home page serves the calendar island under the masthead band and headline strip, both centerfolds return 200 with their own stylesheet applied, the listing page carries the yellow tag, the about page, the archive redirect, the calendar feed and the JSON export all answer, and the export presents the two centerfold URLs as those defenses' pages.

## Why it matters

Until this evening the site on phdtv.net was the quiet list from the first week. It is now the print TV guide: four calendar views, colour by major field, the headline strip, the about page, and the first two centerfolds. Four branches built in parallel over one afternoon landed without any of them blocking another, which is the working arrangement the earlier entries describe finally paying off.

## How it works

**Merge, not rebase.** The repository's history had been linear, and the about page had been integrated by fast-forward. The calendar branch could not be: its seventeen commits all touch files the about page also changed, so replaying them would have meant resolving the same conflicts in the shell, the stylesheet, the page functions and the loader four or five times over. One merge commit with one conflict pass across ten files was the honest choice, and the centerfold branch followed the same way with six. The notebook now records the rule.

**The resolution principle.** In every conflict the branch's rewrite wins and the about page's additions are re-added on top: the nav and footer links, the `universities` list beside `majors` in the loader, the about route beside the centerfold loop, the about page function beside the centerfold one, its styles before the narrow-screen rules, and its tests beside the new ones. Each merge was verified before commit: the full suite including the real Vite build, the type check, the validator and the schema check.

**Leaving the worktree.** The centerfold session had been isolated in its worktree, whose Bash guard refuses git operations against other checkouts. Integration into `main` therefore started with leaving the worktree (keeping it) so the session's working directory became the primary checkout; the merges ran there.

**Deploy is a push.** Nothing new was needed: the existing workflow on `main` validates, builds with the production origin and rsyncs `dist/` through the restricted key. Watching the run and curling the routes afterwards is the whole ceremony.

## What's next

- The dark-mode red is still the calendar branch's `#e03a48`, just under AA contrast against white; the proposed `#d63541` is a one-token change pending the user's word.
- The three worktrees under `.claude/worktrees/` hold only merged branches and can be removed.
- Editorial content and photos for the two sample centerfolds; production hides their empty blocks until then.
- The checkout and setup-node actions in the workflows still target Node 20; GitHub runs them on Node 24 for now, so a bump to v5 will silence the notice.

## Surprises

`main` was already ten commits ahead of `origin` before integration began, so the deploy carried everything since the move to the VPS in one push. And the Storybook branch slipped in between the merges and the push, fast-forwarded by its own session: the first time four sessions' work shipped in a single deploy.
