# PhD TV

A calendar of PhD defenses that are livestreamed for free, with links to the streams, and an archive of past defenses where a recording exists on the web.

In the Netherlands, the Nordic countries and elsewhere a defense is a public ceremony, and most universities kept the livestream running after 2020. The listings are scattered across dozens of agenda pages; this project gathers them in one place, in your local time, with a calendar feed you can subscribe to.

## How it works

The git repository is the database. Every defense is one Markdown file under [`records/`](records/), every institution one YAML file under [`universities/`](universities/), and the allowed discipline tags live in [`disciplines.yaml`](disciplines.yaml). A pull request is the review queue: every change is validated automatically, a curator merges it, and the site, the calendar feeds and the JSON export are rebuilt from the merged tree.

Records arrive through three channels: curators add them by hand, people submit them, and scrapers open pull requests from university agenda pages. All three produce the same file format.

## The record format

```yaml
---
candidate: Jane Doe                              # as written on the university page
title: "Learning to schedule under uncertainty"  # quote titles that contain colons
university: tudelft                              # slug of a file under universities/
faculty: "Electrical Engineering, Mathematics and Computer Science"   # optional
disciplines: [computer-and-information-sciences] # slugs from disciplines.yaml
language: en                                     # BCP 47 tag, optional
starts_at: "2026-09-15T12:30:00+02:00"           # quoted, with the UTC offset of the time zone below
timezone: Europe/Amsterdam                       # IANA name
duration_minutes: 60                             # optional, defaults to 90
stream:                                          # optional until the university publishes it
  url: https://collegerama.tudelft.nl/live/1
  platform: university                           # youtube | vimeo | zoom | teams | university | other
recording:                                       # optional; either a link ...
  url: https://www.youtube.com/watch?v=abc123
  platform: youtube
# recording:                                     # ... or an explicit statement that none exists
#   status: none
thesis_url: https://repository.tudelft.nl/record/1   # optional
status: published                                # unverified | published | hidden
source:
  channel: curated                               # scraped | submitted | curated
  url: https://www.tudelft.nl/en/events/...      # required for scraped records
verified_by: b3008                               # required before a record can be published
---
An optional abstract or curator note in Markdown.
```

The file name is the record's identity: `records/<year>/<local date>-<university slug>-<candidate slug>.md`. Two people describing the same defense produce the same path, so duplicates become a diff instead of a second entry.

Two rules catch most mistakes. Timestamps must be quoted, because an unquoted one is parsed as a date object and loses its offset. The offset in `starts_at` must be the offset of `timezone` at that instant, so a defense written with the wrong zone fails validation with the expected offset in the message.

The machine-readable versions of the format are generated from the TypeScript schemas: [`schema/record.schema.json`](schema/record.schema.json) and [`schema/university.schema.json`](schema/university.schema.json).

## Adding or correcting a defense

1. Create or edit the file under `records/`. If the institution is new, add `universities/<slug>.yaml` with its name, country, time zone and website.
2. Run `npm run validate`. It prints one line per problem as `path: rule: message`, and warns about links that do not respond.
3. Open a pull request. The same validation runs there; a curator reviews the diff and merges.

To attach a recording to a past defense, add the `recording` block to its file. To state that a defense was not recorded, or that the university has since removed the video, use `recording: { status: none }` and say why in the body.

## Removing a listing

Candidates' names come from public university agendas, but anyone listed can ask to be removed. Set `status: hidden` on the record and merge. The file and its history stay in the repository; nothing about it appears on the site, in the feeds or in the export again.

## Automation and curator ownership

Scrapers and other automation will open pull requests as GitHub accounts listed in [`automation.json`](automation.json). For a record that already has `verified_by`, such an account may only fill fields that are still empty and update the `source` block. Any other change to a verified record from an automated account fails validation, so a re-scrape can never undo a curator's correction. Humans are not subject to the rule.

## Using the site

- The front page lists upcoming defenses in your local time, with the institution's time alongside, and surfaces the ones in progress.
- The archive lists past defenses and says plainly whether a recording is available, pending, known not to exist, or simply not known.
- `feeds/all.ics` is a calendar feed of every upcoming defense; `feeds/<discipline>.ics` narrows it to one field. Events update in place when a stream link is added.
- `api/defenses.json` is the whole published dataset with a schema version.

## Development

Everything is TypeScript: the schemas, the validator, the Astro site, the React components and the tests.

```sh
npm install
npm run dev          # local site with hot reload
npm test             # unit, component and build-level tests
npm run typecheck
npm run validate     # records and registry
npm run schema       # regenerate schema/*.json after changing src/schema/
npm run build
```

Planning lives in [`openspec/`](openspec/) and the development log in [`blog/`](blog/).
