# Calendar views for the defense schedule

Date: 2026-09-06
Status: approved in conversation, awaiting review of this document

## Summary

The home page stops being a list and becomes a calendar with day, week, month and year views. One calendar covers past and future: future dates show stream status, past dates show recording status. The archive page goes away. The discipline, institution and recordings-only filters stay and apply to every view. Every view is rendered at build time as the no-script fallback and hydrated in the browser, where the visitor's clock and time zone take over.

The purpose is that a visitor can see not only the details of each defense but when things are coming up and how dense the schedule is, at four scales.

## Decisions taken in the interview

| Question | Decision |
|---|---|
| Upcoming and archive pages | One calendar for everything. The archive page becomes a redirect. |
| Default view | Month, anchored on today. |
| Clicking a compact item | Goes to the existing defense page. No popover. |
| Week layout | Seven columns of stacked chips, not a time grid. |
| Month cell content | One chip per defense: start time and candidate name. |
| Year layout | Twelve mini-month grids with day cells shaded by count. |
| Chip colour | Left border coloured by the discipline's OECD major field, with a legend. |
| Build approach | Hand-built. No calendar library, no date library. |

## Out of scope

Popovers, colour by country, keyboard shortcuts, remembering the last view, a history entry per navigation, a time-grid week, a second taxonomy level in the filters.

## Structure

### Island and state

`DefenseCalendar` is the one island on the home page and replaces `DefenseSchedule`. It owns three pieces of state: the active view, the anchor date and the filters. All three are written to the URL query with `replaceState`, as the filters are today, so a link reopens the same screen and the browser's back button returns to it from a defense page.

Query parameters:

| Parameter | Values | Default |
|---|---|---|
| `view` | `day`, `week`, `month`, `year` | `month` |
| `date` | `YYYY-MM-DD`, the anchor date | today in the visitor's zone |
| `discipline` | a minor-field slug | none |
| `university` | a university slug | none |
| `recorded` | `1` | unset |

Parameters at their default are omitted, so the bare home URL stays clean. An unrecognised view or an unparseable date falls back to the default silently.

The anchor is always a full date, whatever the view. Switching from month to week shows the week containing the anchor, and switching back shows the same month. Previous and next move the anchor by one unit of the active view. "Today" sets the anchor to today.

Island props: `defenses` (every published defense, as today), `majors` (slug and name of each major field, for the legend and colour classes) and `renderedAt` (build time).

### Files

New:

- `src/lib/calendar.ts`. Pure helpers on `YYYY-MM-DD` strings, with no instants and no zones inside, so daylight-saving time cannot affect them. Arithmetic goes through `Date.UTC` and the UTC getters. Exports, subject to refinement in the plan: the `CalendarView` type; `addDays`; `startOfWeek` (Monday); `daysOfWeek`; `weeksOfMonth` (rows of seven dates covering the month, padded with adjacent-month days); `monthsOfYear`; `shift(date, view, delta)` with month and year shifts clamping to the last day of the target month; `periodBounds(view, date)`; `periodLabel(view, date)`; `groupByDate(defenses, zone)` returning a map from date to defenses sorted by start; `nearestDate(dates, bounds, direction)` for the jump links; and the query-parameter encoding of view and date.
- `src/components/DefenseCalendar.tsx`. The island. Renders `FilterBar`, `MajorFieldLegend`, the live strip, `CalendarToolbar` and the active view.
- `src/components/CalendarToolbar.tsx`. Previous, next and Today buttons, the period label, and the view switcher.
- `src/components/DayView.tsx`, `WeekView.tsx`, `MonthView.tsx`, `YearView.tsx`. One per view, each a pure function of the grouped defenses, the anchor date, today and the zone.
- `src/components/DefenseChip.tsx`. The compact link used by the week and month views.
- `src/components/MajorFieldLegend.tsx`. The colour legend.
- `src/site/client/calendar.tsx`. Browser entry, replacing `client/schedule.tsx`.

Changed:

- `src/components/DefenseCard.tsx`. Loses the `mode` prop. The action is the recording status when the phase is past and the stream status otherwise. The time label no longer includes the date, since the day view and the live strip already name the day.
- `src/components/FilterBar.tsx`. The recordings-only checkbox is always shown. The `showRecordedOnly` prop goes.
- `src/lib/filters.ts`. Unchanged in behaviour. The island merges its parameters with the calendar's into one query string.
- `src/lib/defense.ts`. Each entry of `disciplines` gains `major`, the major-field slug. `university` gains an optional `shortName`.
- `src/schema/university.ts`. Optional `short_name`, a non-empty string. `schema/university.schema.json` is regenerated.
- `src/site/data.ts`. Returns `majors` alongside `defenses` and `disciplineSlugs`, and passes a discipline index of name and major to `toDefense`.
- `src/site/assets.ts`. `ISLAND_ENTRIES` maps `DefenseCalendar` to the new client entry and drops `DefenseSchedule`.
- `src/site/pages.tsx`. `homePage` renders the calendar island with the new props. `archivePage` becomes a redirect page. `defensePage` is unchanged.
- `src/site/generate.ts`. Passes `majors` to the home page and emits the redirect at `archive/index.html`. The JSON export carries the new `major` and `shortName` fields, which is additive, so the schema version stays 1.
- `src/components/Shell.tsx`. Navigation is "Calendar", linking to the home page, and "Recordings", linking to the home page with `view=year` and `recorded=1`.
- `src/components/PageIntro.tsx` usage in `pages.tsx`. New lede, see Copy.
- `src/styles/global.css`. Grid, chip, toolbar, mini-month, legend and responsive rules.
- `universities/*.yaml`. `short_name` where the full name is long. Optional and gradual.

Deleted:

- `src/components/DefenseSchedule.tsx`, `src/site/client/schedule.tsx`, `test/components/DefenseSchedule.test.tsx`.

## The views

### Toolbar

Above every view. Left: previous, next and "Today" buttons, with accessible names that include the unit, such as "Previous month". Middle: the period label. Right: the view switcher, a group of four buttons labelled Day, Week, Month and Year, the active one marked with `aria-pressed`.

Period labels: `Tue 15 Sep 2026`, `14 – 20 Sep 2026` (or `28 Sep – 4 Oct 2026` across a month edge, and `29 Dec 2025 – 4 Jan 2026` across a year edge), `September 2026`, `2026`.

In the static output the buttons are inert. No-script visitors get the build month and the chips, which are ordinary links.

### Day

The date as the heading, then the full defense cards sorted by start time. Past days show recording status on each card, future days show the stream link or "Stream link not yet announced".

### Week

Seven columns, Monday to Sunday, each headed by weekday and day number. Today's column header is outlined. Chips stack in start order. Each chip shows the start time, the candidate's name and the institution's short name. The full name is in the tooltip described under Chips.

### Month

A Monday-start grid of five or six rows covering the month. Days from the previous and next months that pad the first and last rows are rendered dimmed and keep their chips, so nothing is hidden at a month edge. Each cell shows its day number top-left, with today outlined. Chips show the start time and the candidate's name. Cells grow to fit their chips.

### Year

Twelve mini-months, four per row. Each day cell is shaded by its count on a four-step scale of the accent colour: none, one, two, three or more. Under each month a caption reads "3 defenses", "1 defense" or "0 defenses". The month name is a button that opens the month view at the first of that month. A shaded day is a button, with an accessible name such as "7 September 2026, 1 defense", that opens the day view on that date. Empty days are inert. No names appear in this view.

### Chips

A chip is a link to the defense page. Its tooltip holds the thesis title, the institution's full name, the institution-local start time with zone abbreviation, and the discipline names. It carries a three-pixel left border in the major-field colour of the defense's first discipline, or grey when the record lists no discipline. A defense in progress shows the existing red "Live" badge. Past chips render at reduced opacity so the eye lands on what is coming.

### Empty periods

Empty periods are the common case with sparse data. When the day, week or month has no defense under the current filters, the view shows a sentence, "No defenses on Tue 16 Sep 2026", "No defenses this week" or "No defenses in September 2026", followed by up to two links: "Previous: Fri 28 Aug 2026" and "Next: Mon 7 Sep 2026". Each jumps the anchor to the nearest date outside the period that has a defense under the current filters, keeping the view. When there is none in that direction, that link is omitted. The year view has no empty state, since the zeros are the information.

### Narrow screens

Below about 40rem viewport width: the week's columns stack into a vertical list of days, empty days included as a short row; the month's chips shrink to coloured dots beside the day number, and tapping a cell with dots opens that day in the day view; the year shows two mini-months per row.

## Time zones and hydration

After the page loads, everything is in the visitor's zone, read from the browser as it is today:

- Which day a defense lands on. Defenses are grouped by the visitor's local date, so a 00:30 Amsterdam defense sits on the previous day for a visitor in New York.
- Which day is today, and therefore where "Today" jumps, which cell is outlined, and which chips are dimmed as past.
- The time on each chip, with the institution's time and zone in the tooltip. The day view cards keep the current two-time label: institution time first, then "your time" when it differs.

Before the browser runs, which is the build output and the no-script fallback, there is no visitor. The static page renders the month containing the build date in UTC, which the daily rebuild keeps current. Each defense is placed on its institution-local date, which is the date in the record's filename, and shows its institution-local time, so the static page and the feeds agree.

The hand-over follows the existing pattern in `useViewerClock`. The first client render repeats the build-time markup so hydration produces no warnings. An effect then reads the visitor's clock and zone and the URL's view, date and filters, and the component re-renders once. The clock ticks every minute, so a chip turns live and later past on its own.

Known consequence: a shared link to a specific week first paints the build month for a moment, then switches. That flash exists today for filters and is the price of a static site without a server.

## Filters, colours and the live strip

The filter bar keeps its three controls: discipline, institution and "Only defenses with a recording". Filters apply before anything is counted or placed, so a month's chips, a year's shading and counts, and the jump links all reflect the same filtered set. The recordings filter hides every future defense, since none can have a recording yet.

Under the filter bar sits the legend: a coloured square and name for each major field that has at least one defense in the dataset. Fields with nothing to show are not listed.

Six colours are defined as CSS custom properties with light and dark variants, chosen to stay apart from each other and from the red used for live. Initial mapping, changeable in one place:

| Major field | Colour |
|---|---|
| Natural sciences | blue |
| Engineering and technology | orange |
| Medical and health sciences | rose |
| Agricultural and veterinary sciences | green |
| Social sciences | purple |
| Humanities and the arts | teal |

Colour is never the only signal. The chip tooltip names the disciplines, the defense page spells them out, and the discipline filter answers the same question exactly.

The "Live now" strip keeps its place above the toolbar and appears in every view whenever a defense is in progress by the visitor's clock. It shows full cards with the stream link, because catching a live defense is the site's main promise.

## Testing

- `test/lib/calendar.test.ts`, new. Weeks of a month start on Monday and pad to full rows for five-row and six-row months. February in a leap year. A week that straddles a year boundary. Shifting a month from 31 January clamps to the end of February. Grouping the same instant lands on different dates in Amsterdam and New York. Period labels across month and year edges. `nearestDate` in both directions and when nothing exists. Query parameters round-trip, and bad values fall back to month and today.
- `test/components/DefenseCalendar.test.tsx`, replacing the schedule tests. Opens in month on today. Each view switch and each previous, next and Today press updates the period label and the URL. The week and month contain the right chips, as links to the defense pages. The year counts change with the filters. An empty week shows the jump links and they land on the right dates. The live strip appears for a defense in progress. Past days in the day view show recording status. The build-time markup hydrates without console errors, and a midnight-edge defense regroups to the visitor's date after mount.
- `test/site/pages.test.tsx` and `test/build/site.test.ts`, extended. The home page contains the month grid for the pinned clock, the archive path emits a redirect, and the JSON export carries the major field.
- `test/schema/university.test.ts`, extended. An optional `short_name` validates and an empty one is rejected.

## Migration and copy

- Home page lede: "Public defenses streamed for free by universities, shown in your local time. Browse by day, week, month or year. Past dates show where a recording exists. Subscribe to the calendar feed to get them in your own calendar."
- `archive/index.html` is a minimal document with a meta refresh to the home page with `view=year` and `recorded=1`, and a link as fallback.
- README: the "Using the site" section describes one page with four views, the filters and the recordings link. The archive bullet goes. The development section's mention of "the two components that run in the browser" still holds.
- `short_name` added to the university files where the full name is long, for example TU Delft, TU/e, KTH, Aalto, UvA, VU Amsterdam, WUR, UEF.
- A devlog entry and a `.devlog/learned.md` update land with the work: the schedule island entity line changes, and the deferred question about a second taxonomy level in the UI gains the note that colour by major field now exists.
