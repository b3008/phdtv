---
type: "Devlog Entry"
title: "The list becomes a calendar: day, week, month and year views designed"
date: 2026-09-06
timestamp: 2026-09-06T16:33:00
tags: [architecture, ux]
description: "An interview settled how the home page turns from a day-grouped list into a hand-built calendar with four views, one page for past and future, chips coloured by OECD major field, and filters that apply everywhere. The spec is committed; implementation has not started."
---

## What changed

The user asked for the defense list to become a calendar with day, week, month and year views, so that a visitor gets not only the details of each defense but a sense of when things are coming up and how dense the schedule is. They asked to be interviewed about the open questions rather than handed a design. This entry records what the interview settled and why. No code changed; the spec lives at `docs/superpowers/specs/2026-09-06-calendar-views-design.md`.

The decisions, in the order they were taken:

| Question | Decision |
| --- | --- |
| The Upcoming and Archive pages | One calendar for everything. Future dates show stream status, past dates show recording status. The archive becomes a redirect to the year view with the recordings filter on. |
| Default view | Month, anchored on today. |
| Clicking a compact item | Goes to the existing defense page. No popover. |
| Week layout | Seven columns of stacked chips, not a Google-Calendar time grid. |
| Month cell | One chip per defense: start time and candidate. |
| Year layout | Twelve mini-months with day cells shaded by count, a wall-calendar page. |
| Chip colour | Left border coloured by the discipline's OECD major field, with a legend. |
| How to build it | By hand. No calendar library, no date library. |

## Why it matters

This is the first change to the site's shape since it went live yesterday, and it changes what the front page is for. The list answered "what is next"; the calendar has to answer "what is next", "how busy is October" and "what did I miss in June" from the same screen. The archive page dissolves into a filter because a calendar that could only move forward would be strange, and a recording is just what a past cell shows.

The library question mattered more than usual. FullCalendar or react-big-calendar would have brought several hundred kilobytes, browser-only rendering that empties the no-script fallback, and stylesheets to fight, all to produce views that are not the ones chosen: stacked chips and shaded mini-months are not what those libraries ship. The whole project is TypeScript and React with no framework layer, and a calendar grid is a few dozen lines of date arithmetic, so hand-building keeps that shape.

## How it works

The design is in the spec; three points are worth pulling out because they took the most thought.

**Time zones move from a label to a placement problem.** The list showed institution time first and viewer time alongside. In a grid, the zone decides which cell a defense sits in: a 00:30 Amsterdam defense is on the previous day in New York. After hydration everything is grouped by the visitor's local date, today is the visitor's today, and chips show the visitor's time with the institution's in the tooltip. Before hydration, which is the build output and the no-script fallback, there is no visitor, so each defense sits on its institution-local date, the date in the record's filename, and the static page agrees with the feeds. The hand-over uses the same first-render-matches-server pattern the schedule island already has.

**Sparse data shaped the views more than the calendar metaphor did.** Twenty-two records across six months means most weeks are empty and no day exceeds two. That ruled out the time grid, whose whole area would be blank, and it made the empty state the common case: an empty week or month shows "Previous: Fri 28 Aug" and "Next: Mon 7 Sep" links that jump to the nearest defense under the current filters, so nobody pages through blank months. The year view exists mostly to make that density visible at once.

**Filters are applied before anything is counted.** Discipline, institution and recordings-only run first, then grouping, then rendering. A month's chips, a year's shading and counts, and the jump links all describe the same filtered set, which is what makes the filters feel like they apply to every view rather than to a list behind it.

Everything the island knows is in the URL: `view`, `date` and the three filter parameters, written with `replaceState` as the filters are today, so a link reopens the same screen and the back button returns to it from a defense page.

## What's next

The user reviews the spec file. Then an implementation plan, then the work: a pure `src/lib/calendar.ts` on `YYYY-MM-DD` strings, one component per view, a chip component, a legend, the major-field slug added to the defense view-model, an optional `short_name` on universities for chip labels, and the CSS, which is most of the effort. The schedule island and its tests go away.

## Surprises

Two ASCII sketches did the work a mockup tool would have. The user declined the browser-based companion and picked layouts from monospace previews inside the questions; the week and year sketches were enough to make the time-grid and heat-strip alternatives look wrong at a glance.

The colour question went the other way from the recommendation. Uniform chips were proposed as the simpler default; the user chose colour by major field, which revives the deferred "second taxonomy level in the UI" thread from the notebook in a form nobody had proposed: the six OECD majors as a legend rather than a filter.

> **Update 2026-09-06, later the same day**: the user asked for a prototype in Claude Design before implementation, driven from this session through the Chrome extension, and mid-way asked that it reflect the aesthetics of a TV guide. The brief sent was the spec condensed plus all 22 real defenses as sample data, with the look section rewritten around listings-magazine and on-screen-guide cues. The prototype exists in the project "PhD TV calendar prototype" but has not been reviewed yet; whether the TV-guide look replaces the quiet look the spec describes is an open thread in `.devlog/learned.md`. Driving Claude Design from the extension needed a few workarounds, recorded there too.
