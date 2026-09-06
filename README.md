# PhD TV

A calendar of PhD defenses that are livestreamed for free, with links to the streams and, for past defenses, to the recording where one exists on the web.

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
centerfold:                                      # optional; gives the defense a feature page, see below
  issue: "No. 37"
  kicker: "This week's centerfold"
  standfirst: "One or two sentences of plain-language framing."
  portrait: /img/centerfold/jane-doe/portrait.jpg   # served from public/, or an absolute http(s) URL
  wide: /img/centerfold/jane-doe/lab.jpg
  detail: /img/centerfold/jane-doe/figure.png
  quote: "A pull quote from the candidate."
  questions:
    - { q: "Why this topic?", a: "…" }
    - { q: "What surprised you?" }               # a question without an answer is hidden until it has one
  facts:                                         # extra rows for the Close-up box
    - [Format, "Public defense, livestreamed"]
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

### Centerfolds

A centerfold is a magazine-style feature page for one defense: the candidate, the thesis title as a banner, photos, three questions, a pull quote, a facts box and a "Tune in" bar. Add a `centerfold` block to the record and the defense gets `/centerfold/<id>/` as its page: the calendar, the feeds and the export link there instead of the plain listing, which stays reachable at `/defenses/<id>/` from the "Listing" link. Every field in the block is editorial and may be left for later; the deployed site hides what is missing, while the dev server (and `SITE_PREVIEW=1 npm run build`) shows a labelled slot in its place so the page can be laid out before the copy and the photos arrive. Image paths that start with `/` are served from a `public/` directory at the project root, which the build copies as is.

## Adding or correcting a defense

1. Create or edit the file under `records/`. If the institution is new, add `universities/<slug>.yaml` with its name, an optional short name for badges, country, time zone and website.
2. Run `npm run validate`. It prints one line per problem as `path: rule: message`, and warns about links that do not respond.
3. Open a pull request. The same validation runs there; a curator reviews the diff and merges.

To attach a recording to a past defense, add the `recording` block to its file. To state that a defense was not recorded, or that the university has since removed the video, use `recording: { status: none }` and say why in the body.

## Removing a listing

Candidates' names come from public university agendas, but anyone listed can ask to be removed. Set `status: hidden` on the record and merge. The file and its history stay in the repository; nothing about it appears on the site, in the feeds or in the export again.

## Automation and curator ownership

Scrapers and other automation will open pull requests as GitHub accounts listed in [`automation.json`](automation.json). For a record that already has `verified_by`, such an account may only fill fields that are still empty and update the `source` block. Any other change to a verified record from an automated account fails validation, so a re-scrape can never undo a curator's correction. Humans are not subject to the rule.

## Using the site

- The front page is a calendar of every listed defense, past and future, in your local time, with day, week, month and year views. Defenses in progress are surfaced above it with their stream link.
- Filters by discipline, institution and "only defenses with a recording" apply to every view; chips are coloured by the discipline's OECD major field.
- Past dates say plainly whether a recording is available, pending, known not to exist, or simply not known. "Recordings" in the header opens the year view with the recordings filter on.
- The view, the date and the filters are in the URL, so a link reopens the same screen.
- `https://phdtv.net/feeds/all.ics` is a calendar feed of every upcoming defense; `feeds/<discipline>.ics` narrows it to one field. Events update in place when a stream link is added.
- `https://phdtv.net/api/defenses.json` is the whole published dataset with a schema version. Each entry's `url` is the page presented for the defense, its centerfold when it has one, and `listingUrl` is always the plain listing.
- Some defenses have a centerfold, a feature page reached from the calendar cards and the listing through a yellow "Centerfold ›" tag.
- `https://phdtv.net/about/` explains where the listings come from, lists the institutions covered, and says how to reach the maintainer. The institution list is generated from `universities/`.

## Development

Everything is TypeScript: the schemas, the validator, the site build, the React components and the tests. There is no site framework. `scripts/build.ts` renders the React pages to HTML, writes the calendar feeds and the JSON export, and uses Vite only to bundle the components that run in the browser and the stylesheets.

```sh
npm install
npm run dev          # build, serve at http://localhost:4321/, rebuild on change; a preview build
npm test             # unit, component and build-level tests
npm run typecheck
npm run validate     # records and registry
npm run schema       # regenerate schema/*.json after changing src/schema/
npm run build        # static site into dist/; SITE_PREVIEW=1 shows the centerfold editorial slots
npm run storybook    # every component in its states, at http://localhost:6006/
npm run build-storybook   # the same as a static site into storybook-static/
```

Every component in `src/components/` has a stories file under `stories/`, and `npm test` renders every story once, so a component without stories or a story that no longer renders fails the build. The stories reuse the test fixtures and the site stylesheet, so a restyle shows up in Storybook without any change there.

## Deployment

The site lives at [phdtv.net](https://phdtv.net/) on a VPS. Every push to `main` (and a daily rebuild at 03:17 UTC) runs `.github/workflows/deploy.yml`: it validates, builds with `SITE_URL=https://phdtv.net` and `SITE_BASE=/`, and rsyncs `dist/` to the server over SSH as a dedicated user whose key can only write that one directory. nginx serves the files with long caching for the hashed assets and revalidation for everything else; certbot keeps the certificate renewed. The repository secret `DEPLOY_SSH_KEY` holds the private key; the server's host key is pinned in `.github/known_hosts`.

The development log lives in [`blog/`](blog/).
