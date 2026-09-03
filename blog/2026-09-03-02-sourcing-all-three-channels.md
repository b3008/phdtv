---
type: "Devlog Entry"
title: "PhD TV: all three sourcing channels are in scope"
date: 2026-09-03
timestamp: 2026-09-03T12:06:51
tags: [architecture, research]
description: "First product exploration for PhD TV settled that defenses will be scraped, submitted, and curated, which reframes curation as the review layer and makes a shared record schema the central seam."
---

## What changed

No code. This session was the first `/opsx:explore` conversation about what `phdtv` actually is: a calendar of PhD defenses that are livestreamed for free, with links to the streams, plus an archive of past defenses where a recording exists on the web.

The one decision reached: **defenses will come from all three channels**, scraping university agenda pages, submissions from candidates and others, and direct curation. None was ruled out.

## Why it matters

"All three" is not three parallel pipes into one table. Scraping and submissions both produce unverified records; curation is what turns them into published ones. That reframe drives the design:

```
   scrapers ------+
                  +--> inbox (unverified) --> curator review --> published
   submissions ---+                              ^
                                                 |
   curator direct entry -------------------------+
```

Consequences that follow:

- **One record schema shared by every channel** is the seam of the system. Scrapers emit it, the form produces it, curators edit it.
- **Provenance on every record** (source, last-seen, verified-by) so a scraped entry and a submitted entry for the same defense merge rather than duplicate. Natural key: university + date + normalized candidate name.
- **Submissions must target existing records**, because the most valuable submission is a recording link added weeks after the defense.
- **A takedown route** from day one, since candidate names come from public agendas but people will ask to be removed.

## How it works

Nothing runs yet. The proposed build order, not yet confirmed by the user:

1. Record schema plus a handful of hand-curated real defenses plus the site. Zero infrastructure, proves the format.
2. First scraper for two or three structured sources (Dutch university agendas are unusually structured and often include the livestream link).
3. Submission form for new entries and updates to existing ones.

## What's next

The next fork is where records and the review queue live: a git repo of YAML/Markdown files with pull requests as the moderation queue and a static site, versus a database with an admin panel. The open question put to the user: is the curator just them for now, and do they want zero servers or a small backend from the start?

Also still open: which universities to seed with, and how recording links get attached after the fact.

## Surprises

The strongest argument for the whole idea surfaced while thinking about supply: in the Netherlands, Sweden, Finland, Norway and Denmark a defense is a legally public ceremony, and most universities kept livestreaming after 2020. The supply is real and steady; it is just scattered across dozens of agenda pages nobody aggregates.
