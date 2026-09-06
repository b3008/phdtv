# Calendar Views Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the day-grouped defense list on the PhD TV home page with a hand-built calendar that has day, week, month and year views, one page for past and future, filters that apply to every view, chips coloured by OECD major field, and a TV-guide look across the site.

**Architecture:** One hydrated React island, `DefenseCalendar`, renders everything below the masthead (headline strip, intro, filters, live strip, toolbar, active view) and owns the view, the anchor date and the filters, all mirrored in the URL query. Pure date helpers on `YYYY-MM-DD` strings live in `src/lib/calendar.ts`; one component per view renders from a `Map<date, Defense[]>` grouped in the viewer's zone after mount and in each institution's zone at build time. The archive page becomes a redirect; the stylesheet is rewritten as a print TV-guide system (newsprint cream, rich black, warm red, process yellow and cyan, hard corners) around self-hosted Archivo Black, Oswald and Archivo.

**Tech Stack:** TypeScript, React 19 (`react-dom/server` at build, hydration in the browser), Vite 8 for the two island bundles and the stylesheet, Zod schemas, Vitest + React Testing Library under jsdom, Node 24. No calendar or date library.

**Spec:** `docs/superpowers/specs/2026-09-06-calendar-views-design.md`

## Global Constraints

- **Shell gotcha:** in this environment the bare `node`, `npm` and `npx` commands are nvm wrapper functions that recurse until `FUNCNEST` is hit. Always call `/opt/homebrew/bin/node`, `/opt/homebrew/bin/npm` and `/opt/homebrew/bin/npx`. Every command below is written that way; do not shorten it.
- TypeScript through and through; every component that renders markup is a React `.tsx` in `src/components/`. No framework layer, no calendar library, no date library.
- Files that `node` runs directly (`scripts/*.ts`, `src/site/build.ts`, `src/site/assets.ts`) must not import a `.tsx` file.
- `tsconfig.json` has `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`; array indexing yields `T | undefined`, optional properties may not be set to `undefined`, and type-only imports must say `type`.
- Test commands: `/opt/homebrew/bin/npx vitest run <file>` for one file, `/opt/homebrew/bin/npm test` for all, `/opt/homebrew/bin/npm run typecheck` for `tsc --noEmit`. Both `npm test` and `npm run typecheck` must pass at the end of every task; `test/build/bundle.test.ts` runs a real build and takes about a minute.
- Weeks start on Monday. Dates in the calendar helpers are `YYYY-MM-DD` strings with no zone.
- Query parameters, exactly: `view` (`day` | `week` | `month` | `year`, default `month`), `date` (`YYYY-MM-DD`, default today), `discipline`, `university`, `recorded=1`. Parameters at their default are omitted.
- Copy, verbatim: lede "Public defenses streamed for free by universities, shown in your local time. Browse by day, week, month or year. Past dates show where a recording exists. Subscribe to the calendar feed to get them in your own calendar."; empty states "No defenses on Tue 16 Sep 2026.", "No defenses this week.", "No defenses in September 2026."; jump links "Previous: Fri 28 Aug 2026" and "Next: Mon 7 Sep 2026"; captions "3 defenses" / "1 defense"; navigation "Calendar" and "Recordings"; kicker "Special issue"; page title "PhD defenses you can" with the highlighted ending "watch live"; headline kickers "On air now" / "Next up", "Coming up", "Catch-up" with texts "<candidate> defends at <institution>!", "<candidate> at <institution> on <Tue 15 Sep 2026>", "No defenses scheduled yet", "<n> defenses you can still catch live", "<n> recordings ready to watch" (singular "1 defense", "1 recording"); starburst "On air!". There is no tagline.
- Fonts: `@fontsource/archivo-black`, `@fontsource/oswald` and `@fontsource/archivo`, all `^5.3.0`, imported from `src/styles/global.css`. No request to Google Fonts. Archivo Black is the display face (masthead, page title, headline strip, period label), Oswald the condensed face (times, labels, badges, buttons, reversed bars), Archivo the body face.
- Major-field colours (light / dark): natural-sciences #2563eb / #93b4ff; engineering-and-technology #ea580c / #fdba74; medical-and-health-sciences #e11d48 / #fda4af; agricultural-and-veterinary-sciences #16a34a / #86efac; social-sciences #7c3aed / #c4b5fd; humanities-and-the-arts #0d9488 / #5eead4.
- Commit after every task with the trailer lines
  `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and
  `Claude-Session: https://claude.ai/code/session_01L3dwE9qGamJauAbeBCZ3U2`.

---

## File structure

| Path | Responsibility |
|---|---|
| `src/lib/calendar.ts` (new) | Pure date arithmetic on `YYYY-MM-DD` strings, period bounds and labels, grouping defenses by local date, jump-link search, query-parameter round trip. |
| `src/lib/defense.ts` | View model: adds `major` to each discipline, `shortName` to the university, and three helpers (`defensePhase`, `institutionLabel`, `majorField`). |
| `src/schema/university.ts` | Optional `short_name`. `schema/university.schema.json` is regenerated. |
| `src/site/data.ts` | Passes a discipline index (name and major) to the view model; returns `majors`. |
| `src/components/DefenseCalendar.tsx` (new) | The island: state, URL, filters, live strip, toolbar, active view. |
| `src/components/CalendarToolbar.tsx` (new) | Previous, next, Today, period label, view switcher. |
| `src/components/HeadlineStrip.tsx` (new) | The three spot-colour headlines under the masthead: on air or next up, defenses still to come, recordings to catch up on. |
| `src/components/PageIntro.tsx` | Gains the slanted kicker and a highlighted ending of the title. |
| `src/components/EmptyPeriod.tsx` (new) | Empty-period sentence with Previous and Next jump buttons. |
| `src/components/DayView.tsx`, `WeekView.tsx`, `MonthView.tsx`, `YearView.tsx` (new) | One view each, pure functions of the grouped defenses, the anchor date, today, the clock and the zone. |
| `src/components/DefenseChip.tsx` (new) | Compact link for week and month cells; exports `fieldClass` and `chipTooltip`. |
| `src/components/MajorFieldLegend.tsx` (new) | Colour legend. |
| `src/components/DefenseCard.tsx` | Full card; action chosen by phase; institution badge. |
| `src/components/FilterBar.tsx` | Recordings checkbox always shown; labels wrapped for styling. |
| `src/components/Shell.tsx` | Full-width masthead band (red logo box with yellow offset shadow), Calendar and Recordings navigation with the current page marked, inner columns. |
| `src/components/DefensePage.tsx` | Adds the institution badge; live pill class renamed. |
| `src/site/client/calendar.tsx` (new) | Browser entry; replaces `client/schedule.tsx`. |
| `src/site/assets.ts`, `src/site/document.tsx`, `src/site/pages.tsx`, `src/site/generate.ts` | Island registry, `refresh` meta, home page with majors, archive redirect. |
| `src/styles/global.css` | Rewritten: fonts, the spot-ink tokens, every component's rules, responsive rules. |
| `src/components/DefenseSchedule.tsx`, `src/site/client/schedule.tsx`, `test/components/DefenseSchedule.test.tsx` | Deleted in Task 8. |

---

### Task 1: Data model — major field, short institution name, phase helper

**Files:**
- Modify: `src/schema/university.ts`
- Modify: `src/lib/defense.ts`
- Modify: `src/site/data.ts`
- Modify: `test/fixtures/defenses.ts`, `test/lib/filters.test.ts:5-7`, `test/components/DefenseSchedule.test.tsx:18`
- Modify: `universities/*.yaml` (all 16)
- Regenerate: `schema/university.schema.json`
- Test: `test/schema/university.test.ts`, `test/lib/defense.test.ts`, `test/site/data.test.ts`

**Interfaces:**
- Produces: `Defense.disciplines: Array<{ slug: string; name: string; major: string }>`; `Defense.university.shortName?: string`; `DefenseInput.disciplineIndex: Record<string, { name: string; major: string }>` (replaces `disciplineNames`); `SiteData.majors: Array<{ slug: string; name: string }>`; `defensePhase(defense: Defense, now: Date): Phase`; `institutionLabel(defense: Defense): string`; `majorField(defense: Defense): string | undefined`.

- [ ] **Step 1: Write the failing tests**

In `test/schema/university.test.ts`, add inside `describe('universitySchema', …)`:

```ts
  it('accepts an optional short_name and rejects an empty one', () => {
    expect(universitySchema.safeParse({ ...valid, short_name: 'TU Delft' }).success).toBe(true);
    expect(firstIssuePath({ ...valid, short_name: '  ' })).toBe('short_name');
  });
```

In `test/lib/defense.test.ts`, replace the `disciplineNames` line of `input` with:

```ts
  disciplineIndex: {
    'computer-and-information-sciences': { name: 'Computer and information sciences', major: 'natural-sciences' },
    mathematics: { name: 'Mathematics', major: 'natural-sciences' },
  },
```

change the `resolves the institution and discipline names` expectation to:

```ts
    expect(defense.disciplines).toEqual([
      { slug: 'computer-and-information-sciences', name: 'Computer and information sciences', major: 'natural-sciences' },
      { slug: 'mathematics', name: 'Mathematics', major: 'natural-sciences' },
    ]);
```

and add two tests at the end of the describe:

```ts
  it('carries the short institution name when the registry has one', () => {
    const withShort = toDefense({ ...input, university: { ...input.university, short_name: 'TU Delft' } });
    expect(withShort.university.shortName).toBe('TU Delft');
    expect(institutionLabel(withShort)).toBe('TU Delft');
    expect(institutionLabel(defense)).toBe('Delft University of Technology');
  });

  it('classifies its phase against a clock and names its first major field', () => {
    expect(defensePhase(defense, new Date('2026-09-15T10:00:00Z'))).toBe('upcoming');
    expect(defensePhase(defense, new Date('2026-09-15T10:45:00Z'))).toBe('live');
    expect(defensePhase(defense, new Date('2026-09-15T12:00:00Z'))).toBe('past');
    expect(majorField(defense)).toBe('natural-sciences');
    expect(majorField({ ...defense, disciplines: [] })).toBeUndefined();
  });
```

with the import changed to `import { defensePhase, institutionLabel, majorField, toDefense, type DefenseInput } from '../../src/lib/defense.ts';`.

In `test/site/data.test.ts`, inside `describe('loadSiteData on the repository', …)`, add:

```ts
  it('resolves each discipline to its major field and lists the majors', () => {
    const one = data.defenses.find((d) => d.key === '2026/2026-09-15-utrecht-chris-ten-dam');
    expect(one?.disciplines.map((d) => d.major)).toContain('social-sciences');
    expect(data.majors.map((m) => m.slug)).toEqual([
      'natural-sciences',
      'engineering-and-technology',
      'medical-and-health-sciences',
      'agricultural-and-veterinary-sciences',
      'social-sciences',
      'humanities-and-the-arts',
    ]);
    expect(one?.university.shortName).toBe('UU');
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `/opt/homebrew/bin/npx vitest run test/schema/university.test.ts test/lib/defense.test.ts test/site/data.test.ts`
Expected: FAIL — `short_name` is an unrecognized key, `disciplineIndex` is not a property of `DefenseInput`, `defensePhase` is not exported, `data.majors` is undefined.

- [ ] **Step 3: Extend the university schema and regenerate the JSON schema**

In `src/schema/university.ts`, add `short_name` after `name`:

```ts
export const universitySchema = z
  .object({
    slug,
    name: nonEmptyString,
    /** Label for badges and chips, e.g. "TU Delft"; the full name is used when absent. */
    short_name: nonEmptyString.optional(),
    country: isoCountry,
    timezone: ianaTimeZone,
    website: httpUrl.optional(),
    agenda_url: httpUrl.optional(),
    aliases: z.array(nonEmptyString).optional(),
  })
  .strict();
```

Run: `/opt/homebrew/bin/npm run schema` and check `git diff schema/university.schema.json` shows a `short_name` property with `"type": "string", "minLength": 1`.

- [ ] **Step 4: Extend the view model**

Replace `src/lib/defense.ts` with:

```ts
import type { DefenseRecord, Platform, RecordStatus } from '../schema/record.ts';
import type { University } from '../schema/university.ts';
import { withBase } from './paths.ts';
import { classify, DEFAULT_DURATION_MINUTES, defenseWindow, type Phase } from './time.ts';

export interface DefenseInput {
  /** Collection entry id, e.g. 2026/2026-09-15-tudelft-jane-doe. */
  id: string;
  body: string;
  record: DefenseRecord;
  university: University;
  /** Minor-field slug to its display name and major-field slug. */
  disciplineIndex: Record<string, { name: string; major: string }>;
  /** Site base path, e.g. /phdtv/. */
  base: string;
}

export interface DefenseLink {
  url: string;
  platform: Platform;
}

export type DefenseRecording = (DefenseLink & { availableFrom?: string }) | { status: 'none' };

export interface DefenseDiscipline {
  slug: string;
  name: string;
  /** Major-field slug from disciplines.yaml, e.g. natural-sciences. */
  major: string;
}

/** Serialisable view of one defense, as handed to React components. */
export interface Defense {
  key: string;
  url: string;
  candidate: string;
  title: string;
  university: { slug: string; name: string; shortName?: string; country: string; website?: string };
  faculty?: string;
  disciplines: DefenseDiscipline[];
  language?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  durationMinutes: number;
  stream?: DefenseLink;
  recording?: DefenseRecording;
  thesisUrl?: string;
  status: RecordStatus;
  source: { channel: DefenseRecord['source']['channel']; url?: string };
  abstract?: string;
}

/** The same object type with every `| undefined` property made optional, matching exactOptionalPropertyTypes. */
type Defined<T> = { [K in keyof T as undefined extends T[K] ? never : K]: T[K] } & {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
};

const defined = <T extends object>(obj: T): Defined<T> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Defined<T>;

export function defensePath(id: string): string {
  return `/defenses/${id}/`;
}

export function toDefense({ id, body, record, university, disciplineIndex, base }: DefenseInput): Defense {
  const { end } = defenseWindow(record);
  const recording: DefenseRecording | undefined = record.recording
    ? 'url' in record.recording
      ? defined({ url: record.recording.url, platform: record.recording.platform, availableFrom: record.recording.available_from })
      : { status: 'none' }
    : undefined;
  return defined({
    key: id,
    url: withBase(base, defensePath(id)),
    candidate: record.candidate,
    title: record.title,
    university: defined({
      slug: university.slug,
      name: university.name,
      shortName: university.short_name,
      country: university.country,
      website: university.website,
    }),
    faculty: record.faculty,
    disciplines: (record.disciplines ?? []).map((slug) => ({
      slug,
      name: disciplineIndex[slug]?.name ?? slug,
      major: disciplineIndex[slug]?.major ?? '',
    })),
    language: record.language,
    startsAt: record.starts_at,
    endsAt: end.toISOString(),
    timezone: record.timezone,
    durationMinutes: record.duration_minutes ?? DEFAULT_DURATION_MINUTES,
    stream: record.stream,
    recording,
    thesisUrl: record.thesis_url,
    status: record.status,
    source: defined({ channel: record.source.channel, url: record.source.url }),
    abstract: body.trim() || undefined,
  });
}

/** Upcoming, live or past against the given clock. */
export function defensePhase(defense: Defense, now: Date): Phase {
  return classify({ starts_at: defense.startsAt, timezone: defense.timezone, duration_minutes: defense.durationMinutes }, now);
}

/** The short institution name for badges, falling back to the full name. */
export function institutionLabel(defense: Defense): string {
  return defense.university.shortName ?? defense.university.name;
}

/** Major-field slug of the first discipline, which decides a chip's colour; undefined when the record lists none. */
export function majorField(defense: Defense): string | undefined {
  return defense.disciplines[0]?.major;
}
```

- [ ] **Step 5: Pass the discipline index and the majors from the loader**

In `src/site/data.ts`, change the interface and the two lines that build and use `disciplineNames`:

```ts
export interface SiteData {
  /** Published defenses, soonest first. */
  defenses: Defense[];
  /** Every minor-field slug of the vocabulary, in file order. */
  disciplineSlugs: string[];
  /** The major fields of the vocabulary, in file order, for legends and colours. */
  majors: Array<{ slug: string; name: string }>;
}
```

```ts
  const disciplineIndex = Object.fromEntries(disciplines.minors.map((m) => [m.slug, { name: m.name, major: m.major }]));
```

```ts
    defenses.push(toDefense({ id, body: file.body, record: parsed.data, university, disciplineIndex, base }));
```

```ts
  return {
    defenses,
    disciplineSlugs: disciplines.minors.map((m) => m.slug),
    majors: disciplines.majors.map((m) => ({ slug: m.slug, name: m.name })),
  };
```

- [ ] **Step 6: Update the fixtures and the two test files that build discipline literals**

In `test/fixtures/defenses.ts`, change the two lines:

```ts
    university: { slug: 'tudelft', name: 'Delft University of Technology', shortName: 'TU Delft', country: 'NL', website: 'https://www.tudelft.nl/' },
```

```ts
    disciplines: [{ slug: 'computer-and-information-sciences', name: 'Computer and information sciences', major: 'natural-sciences' }],
```

In `test/lib/filters.test.ts` lines 5-7, add `major` to every discipline literal: `{ slug: 'mathematics', name: 'Mathematics', major: 'natural-sciences' }` and `{ slug: 'law', name: 'Law', major: 'social-sciences' }`.

In `test/components/DefenseSchedule.test.tsx` line 18, change the literal to `disciplines: [{ slug: 'law', name: 'Law', major: 'social-sciences' }]`.

- [ ] **Step 7: Add short names to every university file**

Run from the repository root:

```bash
for pair in aalto:Aalto aarhus:Aarhus kth:KTH mit:MIT oulu:Oulu tampere:Tampere "tudelft:TU Delft" "tue:TU/e" uef:UEF uio:UiO uppsala:Uppsala utrecht:UU utwente:UT uva:UvA vu-amsterdam:VU wur:WUR; do
  slug=${pair%%:*}; short=${pair#*:}
  perl -0pi -e "s{^(name:[^\n]*\n)}{\$1short_name: $short\n}m" "universities/$slug.yaml"
done
grep -c short_name universities/*.yaml
```

Expected: every file reports `1`. Then run `/opt/homebrew/bin/npm run validate` and expect no errors (link warnings are fine).

- [ ] **Step 8: Run the tests and the type check**

Run: `/opt/homebrew/bin/npx vitest run test/schema test/lib test/site/data.test.ts && /opt/homebrew/bin/npm run typecheck && /opt/homebrew/bin/npm run schema:check`
Expected: all PASS, "JSON Schema files in … are up to date."

- [ ] **Step 9: Commit**

```bash
git add src/schema/university.ts schema/university.schema.json src/lib/defense.ts src/site/data.ts test universities
git commit -m "$(cat <<'EOF'
Carry the major field and a short institution name in the defense view model

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3dwE9qGamJauAbeBCZ3U2
EOF
)"
```

---

### Task 2: Calendar helpers

**Files:**
- Create: `src/lib/calendar.ts`
- Test: `test/lib/calendar.test.ts`

**Interfaces:**
- Consumes: `Defense` and `Filters`/`searchFromFilters` from `src/lib`; `localDateString` from `src/lib/time.ts`.
- Produces (all exported): `type CalendarView = 'day' | 'week' | 'month' | 'year'`; `CALENDAR_VIEWS`; `DEFAULT_VIEW`; `type DateString = string`; `WEEKDAYS`, `WEEKDAYS_SHORT`, `MONTHS`, `MONTHS_SHORT`; `isDateString(value: string): boolean`; `isCalendarView(value: string): value is CalendarView`; `addDays(date, days)`; `daysInMonth(year, month)`; `weekdayIndex(date): number` (0 = Monday); `startOfWeek(date)`; `daysOfWeek(date): DateString[]`; `startOfMonth(date)`; `endOfMonth(date)`; `weeksOfMonth(date, rows?): DateString[][]`; `monthsOfYear(date): DateString[]`; `sameMonth(a, b)`; `shift(date, view, delta)`; `interface Period { start: DateString; end: DateString }`; `periodBounds(view, date): Period`; `formatDateString(date)` ("Tue 15 Sep 2026"); `formatDateLong(date)` ("Tuesday 15 September 2026"); `periodLabel(view, date)`; `groupByDate(defenses, zone: string | null): Map<DateString, Defense[]>`; `nearestDate(dates, period, direction: -1 | 1): DateString | undefined`; `interface CalendarState { view: CalendarView; date: DateString }`; `calendarFromSearch(search, today): CalendarState`; `searchFromState(state, filters, today): string`; `todayIn(zone, now): DateString`.

- [ ] **Step 1: Write the failing tests**

Create `test/lib/calendar.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  addDays,
  calendarFromSearch,
  daysInMonth,
  daysOfWeek,
  formatDateLong,
  formatDateString,
  groupByDate,
  isDateString,
  monthsOfYear,
  nearestDate,
  periodBounds,
  periodLabel,
  searchFromState,
  shift,
  startOfWeek,
  todayIn,
  weeksOfMonth,
} from '../../src/lib/calendar.ts';
import { fixtureDefense } from '../fixtures/defenses.ts';

describe('date strings', () => {
  it('validates the shape and the calendar', () => {
    expect(isDateString('2026-09-15')).toBe(true);
    expect(isDateString('2026-02-30')).toBe(false);
    expect(isDateString('15-09-2026')).toBe(false);
    expect(isDateString('')).toBe(false);
  });
  it('adds days across month and year edges', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });
  it('knows month lengths and leap years', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
  it('gives today in a zone', () => {
    expect(todayIn('Europe/Amsterdam', new Date('2026-09-15T22:30:00Z'))).toBe('2026-09-16');
    expect(todayIn('UTC', new Date('2026-09-15T22:30:00Z'))).toBe('2026-09-15');
  });
});

describe('weeks and months', () => {
  it('starts weeks on Monday', () => {
    expect(startOfWeek('2026-09-06')).toBe('2026-08-31');
    expect(startOfWeek('2026-08-31')).toBe('2026-08-31');
    expect(startOfWeek('2026-01-01')).toBe('2025-12-29');
    expect(daysOfWeek('2026-09-09')).toEqual(['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13']);
  });
  it('covers a month with Monday-start rows padded from the neighbours', () => {
    const rows = weeksOfMonth('2026-09-15');
    expect(rows).toHaveLength(5);
    expect(rows[0]?.[0]).toBe('2026-08-31');
    expect(rows[4]?.[6]).toBe('2026-10-04');
  });
  it('needs six rows for a month that starts late in the week', () => {
    expect(weeksOfMonth('2026-08-15')).toHaveLength(6);
  });
  it('can force six rows for aligned mini-months', () => {
    const rows = weeksOfMonth('2026-09-15', 6);
    expect(rows).toHaveLength(6);
    expect(rows[5]?.[6]).toBe('2026-10-11');
  });
  it('lists the first of every month of a year', () => {
    const months = monthsOfYear('2026-09-15');
    expect(months).toHaveLength(12);
    expect(months[0]).toBe('2026-01-01');
    expect(months[11]).toBe('2026-12-01');
  });
});

describe('shift', () => {
  it('moves by a day or a week', () => {
    expect(shift('2026-09-07', 'day', 1)).toBe('2026-09-08');
    expect(shift('2026-09-07', 'week', -1)).toBe('2026-08-31');
  });
  it('moves by a month and clamps to the last day', () => {
    expect(shift('2026-01-31', 'month', 1)).toBe('2026-02-28');
    expect(shift('2026-12-15', 'month', 1)).toBe('2027-01-15');
    expect(shift('2026-01-15', 'month', -1)).toBe('2025-12-15');
  });
  it('moves by a year and clamps 29 February', () => {
    expect(shift('2028-02-29', 'year', 1)).toBe('2029-02-28');
    expect(shift('2026-09-07', 'year', -1)).toBe('2025-09-07');
  });
});

describe('periods and labels', () => {
  it('bounds each view', () => {
    expect(periodBounds('day', '2026-09-15')).toEqual({ start: '2026-09-15', end: '2026-09-15' });
    expect(periodBounds('week', '2026-09-16')).toEqual({ start: '2026-09-14', end: '2026-09-20' });
    expect(periodBounds('month', '2026-09-16')).toEqual({ start: '2026-09-01', end: '2026-09-30' });
    expect(periodBounds('year', '2026-09-16')).toEqual({ start: '2026-01-01', end: '2026-12-31' });
  });
  it('formats dates like the rest of the site', () => {
    expect(formatDateString('2026-09-15')).toBe('Tue 15 Sep 2026');
    expect(formatDateLong('2026-09-07')).toBe('Monday 7 September 2026');
  });
  it('labels periods, with the week label folding shared month and year', () => {
    expect(periodLabel('day', '2026-09-15')).toBe('Tue 15 Sep 2026');
    expect(periodLabel('week', '2026-09-16')).toBe('14 – 20 Sep 2026');
    expect(periodLabel('week', '2026-09-30')).toBe('28 Sep – 4 Oct 2026');
    expect(periodLabel('week', '2026-01-01')).toBe('29 Dec 2025 – 4 Jan 2026');
    expect(periodLabel('month', '2026-09-16')).toBe('September 2026');
    expect(periodLabel('year', '2026-09-16')).toBe('2026');
  });
});

describe('groupByDate', () => {
  const late = fixtureDefense({ key: 'late', startsAt: '2026-09-16T00:30:00+02:00', endsAt: '2026-09-15T23:30:00.000Z' });
  const noon = fixtureDefense({ key: 'noon', startsAt: '2026-09-15T12:00:00+02:00', endsAt: '2026-09-15T11:00:00.000Z' });
  const morning = fixtureDefense({ key: 'morning', startsAt: '2026-09-15T09:00:00+03:00', endsAt: '2026-09-15T07:00:00.000Z', timezone: 'Europe/Helsinki' });

  it('places a defense on the date it falls on in the given zone', () => {
    expect([...groupByDate([late], 'Europe/Amsterdam').keys()]).toEqual(['2026-09-16']);
    expect([...groupByDate([late], 'America/New_York').keys()]).toEqual(['2026-09-15']);
  });
  it('uses each institution zone when no viewer zone is known', () => {
    expect([...groupByDate([late], null).keys()]).toEqual(['2026-09-16']);
  });
  it('sorts a day by instant, not by the text of the timestamp', () => {
    const groups = groupByDate([noon, morning], 'Europe/Amsterdam');
    expect(groups.get('2026-09-15')?.map((d) => d.key)).toEqual(['morning', 'noon']);
  });
});

describe('nearestDate', () => {
  const dates = ['2026-07-01', '2026-08-28', '2026-09-07', '2026-09-09'];
  const period = periodBounds('week', '2026-09-01');
  it('finds the closest date before and after a period', () => {
    expect(nearestDate(dates, period, -1)).toBe('2026-08-28');
    expect(nearestDate(dates, period, 1)).toBe('2026-09-07');
  });
  it('is undefined when nothing lies in that direction', () => {
    expect(nearestDate(['2026-09-07'], period, -1)).toBeUndefined();
    expect(nearestDate([], period, 1)).toBeUndefined();
  });
});

describe('calendar state in the query string', () => {
  const today = '2026-09-07';
  it('reads a view and a date', () => {
    expect(calendarFromSearch('?view=week&date=2026-09-14', today)).toEqual({ view: 'week', date: '2026-09-14' });
  });
  it('falls back to month and today for missing or bad values', () => {
    expect(calendarFromSearch('', today)).toEqual({ view: 'month', date: today });
    expect(calendarFromSearch('?view=bogus&date=2026-02-30', today)).toEqual({ view: 'month', date: today });
  });
  it('writes filters first and omits defaults', () => {
    expect(searchFromState({ view: 'month', date: today }, {}, today)).toBe('');
    expect(searchFromState({ view: 'week', date: '2026-09-14' }, { discipline: 'law' }, today)).toBe('?discipline=law&view=week&date=2026-09-14');
    expect(searchFromState({ view: 'month', date: '2026-10-07' }, { recordedOnly: true }, today)).toBe('?recorded=1&date=2026-10-07');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `/opt/homebrew/bin/npx vitest run test/lib/calendar.test.ts`
Expected: FAIL — cannot resolve `../../src/lib/calendar.ts`.

- [ ] **Step 3: Write the helpers**

Create `src/lib/calendar.ts`:

```ts
// Calendar arithmetic on YYYY-MM-DD strings. No instants and no zones inside, so daylight-saving time cannot
// move a date; the only zone-aware step is turning a defense's instant into a date, done via localDateString.
import type { Defense } from './defense.ts';
import { searchFromFilters, type Filters } from './filters.ts';
import { localDateString } from './time.ts';

export type CalendarView = 'day' | 'week' | 'month' | 'year';
export const CALENDAR_VIEWS: readonly CalendarView[] = ['day', 'week', 'month', 'year'];
export const DEFAULT_VIEW: CalendarView = 'month';

/** A calendar date as YYYY-MM-DD with no zone attached. */
export type DateString = string;

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

interface Parts {
  year: number;
  /** 1 to 12. */
  month: number;
  day: number;
}

function parts(date: DateString): Parts {
  const [year, month, day] = date.split('-').map(Number);
  return { year: year ?? 0, month: month ?? 0, day: day ?? 0 };
}

function fromParts(year: number, month: number, day: number): DateString {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toUtc(date: DateString): Date {
  const p = parts(date);
  return new Date(Date.UTC(p.year, p.month - 1, p.day));
}

function fromUtc(at: Date): DateString {
  return fromParts(at.getUTCFullYear(), at.getUTCMonth() + 1, at.getUTCDate());
}

/** True for a well-formed date that exists, so 2026-02-30 is rejected. */
export function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && fromUtc(toUtc(value)) === value;
}

export function isCalendarView(value: string): value is CalendarView {
  return (CALENDAR_VIEWS as readonly string[]).includes(value);
}

export function addDays(date: DateString, days: number): DateString {
  const at = toUtc(date);
  at.setUTCDate(at.getUTCDate() + days);
  return fromUtc(at);
}

/** `month` is 1 to 12. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 0 for Monday through 6 for Sunday. */
export function weekdayIndex(date: DateString): number {
  return (toUtc(date).getUTCDay() + 6) % 7;
}

export function startOfWeek(date: DateString): DateString {
  return addDays(date, -weekdayIndex(date));
}

export function daysOfWeek(date: DateString): DateString[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function startOfMonth(date: DateString): DateString {
  const p = parts(date);
  return fromParts(p.year, p.month, 1);
}

export function endOfMonth(date: DateString): DateString {
  const p = parts(date);
  return fromParts(p.year, p.month, daysInMonth(p.year, p.month));
}

/**
 * Monday-start rows of seven dates covering the month, padded with days of the neighbouring months.
 * `rows` forces a fixed count (six keeps mini-months the same height).
 */
export function weeksOfMonth(date: DateString, rows?: number): DateString[][] {
  const first = startOfMonth(date);
  const lead = weekdayIndex(first);
  const p = parts(date);
  const count = rows ?? Math.ceil((lead + daysInMonth(p.year, p.month)) / 7);
  const start = addDays(first, -lead);
  return Array.from({ length: count }, (_, row) => Array.from({ length: 7 }, (_, col) => addDays(start, row * 7 + col)));
}

export function monthsOfYear(date: DateString): DateString[] {
  const { year } = parts(date);
  return Array.from({ length: 12 }, (_, i) => fromParts(year, i + 1, 1));
}

export function sameMonth(a: DateString, b: DateString): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

/** Move by `delta` units of the view; month and year moves clamp the day to the target month's length. */
export function shift(date: DateString, view: CalendarView, delta: number): DateString {
  const p = parts(date);
  switch (view) {
    case 'day':
      return addDays(date, delta);
    case 'week':
      return addDays(date, 7 * delta);
    case 'month': {
      const index = p.year * 12 + (p.month - 1) + delta;
      const year = Math.floor(index / 12);
      const month = (index % 12) + 1;
      return fromParts(year, month, Math.min(p.day, daysInMonth(year, month)));
    }
    case 'year':
      return fromParts(p.year + delta, p.month, Math.min(p.day, daysInMonth(p.year + delta, p.month)));
  }
}

export interface Period {
  start: DateString;
  end: DateString;
}

export function periodBounds(view: CalendarView, date: DateString): Period {
  switch (view) {
    case 'day':
      return { start: date, end: date };
    case 'week': {
      const start = startOfWeek(date);
      return { start, end: addDays(start, 6) };
    }
    case 'month':
      return { start: startOfMonth(date), end: endOfMonth(date) };
    case 'year': {
      const { year } = parts(date);
      return { start: fromParts(year, 1, 1), end: fromParts(year, 12, 31) };
    }
  }
}

/** e.g. "Tue 15 Sep 2026", the same shape formatDate in time.ts gives an instant. */
export function formatDateString(date: DateString): string {
  const p = parts(date);
  return `${WEEKDAYS_SHORT[weekdayIndex(date)]} ${p.day} ${MONTHS_SHORT[p.month - 1]} ${p.year}`;
}

/** e.g. "Tuesday 15 September 2026". */
export function formatDateLong(date: DateString): string {
  const p = parts(date);
  return `${WEEKDAYS[weekdayIndex(date)]} ${p.day} ${MONTHS[p.month - 1]} ${p.year}`;
}

export function periodLabel(view: CalendarView, date: DateString): string {
  const p = parts(date);
  switch (view) {
    case 'day':
      return formatDateString(date);
    case 'week': {
      const { start, end } = periodBounds('week', date);
      const a = parts(start);
      const b = parts(end);
      if (a.year !== b.year) return `${a.day} ${MONTHS_SHORT[a.month - 1]} ${a.year} – ${b.day} ${MONTHS_SHORT[b.month - 1]} ${b.year}`;
      if (a.month !== b.month) return `${a.day} ${MONTHS_SHORT[a.month - 1]} – ${b.day} ${MONTHS_SHORT[b.month - 1]} ${b.year}`;
      return `${a.day} – ${b.day} ${MONTHS_SHORT[a.month - 1]} ${a.year}`;
    }
    case 'month':
      return `${MONTHS[p.month - 1]} ${p.year}`;
    case 'year':
      return String(p.year);
  }
}

/**
 * Defenses by the date they fall on in `zone`, or in each defense's own institution zone when `zone` is null
 * (the build-time render, which has no viewer). Each day's list is sorted by instant.
 */
export function groupByDate(defenses: Defense[], zone: string | null): Map<DateString, Defense[]> {
  const groups = new Map<DateString, Defense[]>();
  const sorted = [...defenses].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  for (const defense of sorted) {
    const key = localDateString(zone ?? defense.timezone, new Date(defense.startsAt));
    const list = groups.get(key);
    if (list) list.push(defense);
    else groups.set(key, [defense]);
  }
  return groups;
}

/** The nearest date strictly before the period (direction -1) or strictly after it (direction 1). */
export function nearestDate(dates: Iterable<DateString>, period: Period, direction: -1 | 1): DateString | undefined {
  let best: DateString | undefined;
  for (const date of dates) {
    const outside = direction < 0 ? date < period.start : date > period.end;
    if (!outside) continue;
    if (best === undefined || (direction < 0 ? date > best : date < best)) best = date;
  }
  return best;
}

export interface CalendarState {
  view: CalendarView;
  date: DateString;
}

/** View and anchor date from the query; anything unrecognised falls back to the month view on `today`. */
export function calendarFromSearch(search: string, today: DateString): CalendarState {
  const params = new URLSearchParams(search);
  const view = params.get('view') ?? '';
  const date = params.get('date') ?? '';
  return { view: isCalendarView(view) ? view : DEFAULT_VIEW, date: isDateString(date) ? date : today };
}

/** One query string for the filters and the calendar state, omitting parameters at their defaults. */
export function searchFromState(state: CalendarState, filters: Filters, today: DateString): string {
  const params = new URLSearchParams(searchFromFilters(filters));
  if (state.view !== DEFAULT_VIEW) params.set('view', state.view);
  if (state.date !== today) params.set('date', state.date);
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** Today's date in a zone; the build uses UTC because it has no viewer. */
export function todayIn(zone: string, now: Date): DateString {
  return localDateString(zone, now);
}
```

- [ ] **Step 4: Run the tests**

Run: `/opt/homebrew/bin/npx vitest run test/lib/calendar.test.ts && /opt/homebrew/bin/npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/calendar.ts test/lib/calendar.test.ts
git commit -m "$(cat <<'EOF'
Add calendar date helpers on YYYY-MM-DD strings

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3dwE9qGamJauAbeBCZ3U2
EOF
)"
```

---

### Task 3: Fonts, tokens, the full stylesheet, the masthead band and the page intro

**Files:**
- Modify: `package.json` (dependencies)
- Rewrite: `src/styles/global.css`
- Modify: `src/components/Shell.tsx`, `src/components/PageIntro.tsx`
- Modify: `src/site/pages.tsx` (column wrappers and the `current` prop only; the page functions themselves change in Task 8)
- Modify: `test/site/pages.test.tsx:67` (the archive nav assertion)
- Test: `test/components/Shell.test.tsx`, `test/components/PageIntro.test.tsx`

**Interfaces:**
- Produces: `Shell({ base?, current?: 'calendar', children })` — the masthead band with the Calendar link marked `aria-current="page"` when `current` is `'calendar'`; `PageIntro({ kicker?, title, highlight?, lede? })` — `highlight` is the trailing part of the title rendered in the live red. Every page's content sits inside a `<div className="column">` (max 64rem, centred); the header band and footer are full width with their own inner column.
- Produces the class names every later task uses. Layout: `shell`, `column`, `masthead-band`, `masthead`, `masthead-logo`, `masthead-nav`, `shell-main`, `shell-footer`, `page-intro`, `kicker`, `page-title`, `page-title-accent`, `page-lede`, `label`, `link-button`, `redirect`. Headline strip (Task 5): `headlines-band`, `headlines`, `headline`, `headline-live`, `headline-upcoming`, `headline-recordings`, `headline-kicker`, `headline-text`. Calendar: `calendar`, `filters`, `filters-check`, `legend`, `legend-swatch`, `live`, `live-heading`, `starburst`, `card`, `card-body`, `card-head`, `card-time`, `card-candidate`, `card-title`, `card-meta`, `card-action`, `badge-inst`, `pill-live`, `tag-now`, `toolbar`, `toolbar-nav`, `toolbar-step`, `toolbar-period`, `toolbar-views`, `empty-period`, `empty-period-links`, `day-view`, `day-heading`, `week`, `week-day`, `week-day-today`, `week-head`, `week-head-dow`, `week-head-num`, `week-chips`, `month`, `month-dows`, `month-dow`, `month-grid`, `month-cell`, `month-cell-pad`, `month-cell-today`, `month-num`, `month-chips`, `month-dots`, `month-dot`, `month-dot-past`, `month-open`, `chip`, `chip-week`, `chip-month`, `chip-past`, `chip-head`, `chip-time`, `chip-name`, `chip-foot`, `year`, `year-month`, `year-month-name`, `year-grid`, `year-dow`, `year-day`, `year-day-pad`, `year-day-0` … `year-day-3`, `year-caption`, `field-<major slug>`, `field-none`. Defense page: `defense-kicker` plus the existing `defense-*` classes.

- [ ] **Step 1: Write the failing tests**

Replace `test/components/Shell.test.tsx` with:

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Shell } from '../../src/components/Shell.tsx';

describe('Shell', () => {
  it('renders the masthead and its children', () => {
    render(
      <Shell>
        <p>hello from the page</p>
      </Shell>,
    );
    expect(screen.getByRole('link', { name: 'PhD TV' }).getAttribute('href')).toBe('/');
    expect(screen.getByText('hello from the page')).toBeTruthy();
  });

  it('links to the calendar and to the recordings under the base path and marks the current page', () => {
    render(
      <Shell base="/phdtv/" current="calendar">
        <p />
      </Shell>,
    );
    const calendar = screen.getByRole('link', { name: 'Calendar' });
    expect(calendar.getAttribute('href')).toBe('/phdtv/');
    expect(calendar.getAttribute('aria-current')).toBe('page');
    const recordings = screen.getByRole('link', { name: 'Recordings' });
    expect(recordings.getAttribute('href')).toBe('/phdtv/?view=year&recorded=1');
    expect(recordings.getAttribute('aria-current')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Archive' })).toBeNull();
  });
});
```

Add to `test/components/PageIntro.test.tsx`, inside the describe:

```tsx
  it('renders a kicker and a highlighted ending of the title', () => {
    render(<PageIntro kicker="Special issue" title="PhD defenses you can" highlight="watch live" />);
    expect(screen.getByRole('heading', { level: 1, name: 'PhD defenses you can watch live' })).toBeTruthy();
    expect(screen.getByText('Special issue').className).toBe('kicker');
    expect(screen.getByText('watch live').className).toBe('page-title-accent');
  });
```

In `test/site/pages.test.tsx`, change the last assertion of the defense page test from `expect(html).toContain('href="/phdtv/archive/"');` to `expect(html).toContain('href="/phdtv/?view=year&amp;recorded=1"');`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `/opt/homebrew/bin/npx vitest run test/components/Shell.test.tsx test/components/PageIntro.test.tsx test/site/pages.test.tsx`
Expected: FAIL — no link named "Calendar", `current` and `kicker` are unknown props, the defense page still links to `/phdtv/archive/`.

- [ ] **Step 3: Install the fonts**

Run: `/opt/homebrew/bin/npm install @fontsource/archivo-black@^5.3.0 @fontsource/oswald@^5.3.0 @fontsource/archivo@^5.3.0`
Expected: the three packages appear under `dependencies` in `package.json`; `ls node_modules/@fontsource/oswald/600.css` exists.

- [ ] **Step 4: Write the masthead band and the page intro**

Replace `src/components/Shell.tsx` with:

```tsx
import type { ReactNode } from 'react';
import { withBase } from '../lib/paths.ts';

interface ShellProps {
  /** Site base path, e.g. /phdtv/. */
  base?: string;
  /** Which navigation entry is the current page, if any. */
  current?: 'calendar';
  children: ReactNode;
}

/**
 * Layout chrome shared by every page. The masthead band and the footer are full width with an inner column;
 * pages put their own content inside a <div className="column">.
 */
export function Shell({ base = '/', current, children }: ShellProps) {
  const home = withBase(base, '/');
  return (
    <div className="shell">
      <header className="masthead-band">
        <div className="column masthead">
          <a className="masthead-logo" href={home} aria-label="PhD TV">
            PhD TV
          </a>
          <nav className="masthead-nav" aria-label="Main">
            <a href={home} aria-current={current === 'calendar' ? 'page' : undefined}>
              Calendar
            </a>
            <a href={`${home}?view=year&recorded=1`}>Recordings</a>
          </nav>
        </div>
      </header>
      <main className="shell-main">{children}</main>
      <footer className="shell-footer">
        <div className="column">
          <p>
            Public PhD defenses that are streamed for free. Listings come from university agendas and
            from people who submit them.
          </p>
        </div>
      </footer>
    </div>
  );
}
```

Replace `src/components/PageIntro.tsx` with:

```tsx
interface PageIntroProps {
  /** Small slanted label above the title, e.g. "Special issue". */
  kicker?: string;
  title: string;
  /** Trailing words of the title set in the live red, e.g. "watch live". */
  highlight?: string;
  lede?: string;
}

export function PageIntro({ kicker, title, highlight, lede }: PageIntroProps) {
  return (
    <header className="page-intro">
      {kicker && <span className="kicker">{kicker}</span>}
      <h1 className="page-title">
        {title}
        {highlight && (
          <>
            {' '}
            <span className="page-title-accent">{highlight}</span>
          </>
        )}
      </h1>
      {lede && <p className="page-lede">{lede}</p>}
    </header>
  );
}
```

In `src/site/pages.tsx`, wrap each page's content in a column and mark the home page current. In `homePage`, change `<Shell base={base}>` to `<Shell base={base} current="calendar">` and wrap the `<PageIntro …/>` and the `<Island …/>` together in `<div className="column">…</div>`. In `archivePage`, wrap its `<PageIntro …/>` and `<Island …/>` in `<div className="column">…</div>`. In `defensePage`, wrap the `<Island …/>` in `<div className="column">…</div>`.

- [ ] **Step 5: Rewrite the stylesheet**

Replace `src/styles/global.css` with:

```css
@import '@fontsource/archivo-black/400.css';
@import '@fontsource/oswald/400.css';
@import '@fontsource/oswald/500.css';
@import '@fontsource/oswald/600.css';
@import '@fontsource/oswald/700.css';
@import '@fontsource/archivo/400.css';
@import '@fontsource/archivo/600.css';
@import '@fontsource/archivo/700.css';

/* tokens: the "spot ink" palette of a print TV guide */
:root {
  color-scheme: light dark;
  --page: #fbf7ea;
  --card: #ffffff;
  --chip: #ffffff;
  --ink: #141210;
  --muted: #615a4f;
  --rule: #141210;
  --hairline: #cdc4b0;
  --accent: #1d4ed8;
  --live: #d90429;
  --yellow: #ffd400;
  --yellow-fg: #141210;
  --cyan: #00a9e0;
  --today: #fff3b0;
  --bar: #141210;
  --bar-fg: #ffd400;
  --band: #141210;
  --band-fg: #ffffff;
  --shade-1: #d3defb;
  --shade-2: #8aa8f2;
  --shade-3: #1d4ed8;
  --shade-3-fg: #ffffff;
  --field-natural-sciences: #2563eb;
  --field-engineering-and-technology: #ea580c;
  --field-medical-and-health-sciences: #e11d48;
  --field-agricultural-and-veterinary-sciences: #16a34a;
  --field-social-sciences: #7c3aed;
  --field-humanities-and-the-arts: #0d9488;
  --sans: 'Archivo', Helvetica, Arial, sans-serif;
  --condensed: 'Oswald', 'Arial Narrow', 'Roboto Condensed', sans-serif;
  --display: 'Archivo Black', 'Arial Black', Impact, sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --page: #15130f;
    --card: #201d17;
    --chip: #282418;
    --ink: #f5eed9;
    --muted: #b0a58f;
    --rule: #7a705d;
    --hairline: #3d3729;
    --accent: #93b4ff;
    --live: #ff4d5a;
    --yellow: #ffd83d;
    --yellow-fg: #15130f;
    --cyan: #3cc7f5;
    --today: #3d3410;
    --bar: #ffd83d;
    --bar-fg: #15130f;
    --band: #0b0a08;
    --band-fg: #f5eed9;
    --shade-1: #2a3247;
    --shade-2: #4c5c85;
    --shade-3: #93b4ff;
    --shade-3-fg: #15130f;
    --field-natural-sciences: #93b4ff;
    --field-engineering-and-technology: #fdba74;
    --field-medical-and-health-sciences: #fda4af;
    --field-agricultural-and-veterinary-sciences: #86efac;
    --field-social-sciences: #c4b5fd;
    --field-humanities-and-the-arts: #5eead4;
  }
}
.field-natural-sciences { --field: var(--field-natural-sciences); }
.field-engineering-and-technology { --field: var(--field-engineering-and-technology); }
.field-medical-and-health-sciences { --field: var(--field-medical-and-health-sciences); }
.field-agricultural-and-veterinary-sciences { --field: var(--field-agricultural-and-veterinary-sciences); }
.field-social-sciences { --field: var(--field-social-sciences); }
.field-humanities-and-the-arts { --field: var(--field-humanities-and-the-arts); }
.field-none { --field: var(--muted); }

/* base: hard corners, flat inks, borders instead of whitespace */
* { box-sizing: border-box; }
html { font: 15px/1.5 var(--sans); color: var(--ink); background: var(--page); -webkit-font-smoothing: antialiased; }
body { margin: 0; }
a { color: var(--accent); }
a:hover { color: var(--live); }
button, select, input { font: inherit; border-radius: 0; }
abbr[title] { text-decoration: none; }
.column { max-width: 64rem; margin: 0 auto; padding: 0 1.25rem; }
.label { font-family: var(--condensed); text-transform: uppercase; letter-spacing: .12em; font-size: .72rem; color: var(--muted); }
.link-button { background: none; border: 0; padding: 0; color: var(--accent); font: inherit; font-weight: 600; cursor: pointer; text-decoration: underline; }
.link-button:hover { color: var(--live); }

/* masthead band */
.masthead-band { background: var(--band); color: var(--band-fg); }
.masthead { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding-top: .9rem; padding-bottom: .9rem; }
.masthead-logo { display: inline-block; background: var(--live); color: #fff; font-family: var(--display); font-size: 3.4rem; line-height: 1; letter-spacing: -.03em; text-transform: uppercase; padding: .5rem 1rem .375rem; text-decoration: none; box-shadow: 6px 6px 0 var(--yellow); }
.masthead-logo:hover { color: #fff; }
.masthead-nav { display: flex; gap: .6rem; padding-bottom: .4rem; }
.masthead-nav a { font-family: var(--condensed); text-transform: uppercase; letter-spacing: .14em; font-size: .8rem; font-weight: 600; color: var(--yellow); text-decoration: none; padding: .25rem .75rem; }
.masthead-nav a:hover { color: var(--band-fg); }
.masthead-nav a[aria-current="page"] { background: var(--yellow); color: var(--yellow-fg); }
.shell-main { padding-top: 0; }
.shell-footer { margin-top: 3rem; border-top: 6px double var(--ink); padding: 1rem 0; color: var(--muted); font-size: .85rem; }

/* headline strip: three spot-colour blurbs continuing the band */
.headlines-band { background: var(--band); }
.headlines { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); list-style: none; margin: 0 auto; }
.headline { padding: .6rem .9rem .75rem; }
.headline-live { background: var(--live); color: #fff; }
.headline-upcoming { background: var(--yellow); color: var(--yellow-fg); }
.headline-recordings { background: var(--cyan); color: #fff; }
.headline-kicker { display: block; font-family: var(--condensed); font-weight: 600; text-transform: uppercase; letter-spacing: .2em; font-size: .62rem; opacity: .85; }
.headline-text { display: block; margin-top: .15rem; font-family: var(--display); font-size: 1.05rem; line-height: 1.15; text-transform: uppercase; letter-spacing: -.01em; text-wrap: pretty; }

/* page intro */
.page-intro { padding: 1.6rem 0 1.25rem; margin-bottom: 1.25rem; border-bottom: 2px solid var(--ink); }
.kicker { display: inline-block; background: var(--yellow); color: var(--yellow-fg); font-family: var(--condensed); font-weight: 600; text-transform: uppercase; letter-spacing: .2em; font-size: .7rem; padding: .2rem .5rem; transform: rotate(-1.5deg); }
.page-title { font-family: var(--display); font-weight: 400; font-size: 2.75rem; line-height: .98; letter-spacing: -.02em; text-transform: uppercase; margin: .6rem 0 0; text-wrap: pretty; }
.page-title-accent { color: var(--live); }
.page-lede { color: var(--muted); margin: .6rem 0 0; max-width: 44rem; font-size: .92rem; line-height: 1.6; text-wrap: pretty; }
.redirect { padding: 3rem 0; }

/* filters and legend */
.filters { display: flex; flex-wrap: wrap; gap: 1rem 1.25rem; align-items: flex-end; margin: 0 0 .75rem; padding: .9rem 1rem; border: 2px solid var(--ink); background: var(--card); }
.filters label { display: flex; flex-direction: column; gap: .3rem; flex: 1 1 12rem; min-width: 12rem; }
.filters select { appearance: none; color: var(--ink); background: var(--page); border: 1px solid var(--ink); padding: .45rem .55rem; font-size: .9rem; width: 100%; }
.filters .filters-check { flex-direction: row; align-items: center; gap: .5rem; flex: 0 0 auto; min-width: 0; padding-bottom: .4rem; font-size: .9rem; cursor: pointer; }
.filters-check input { width: 1rem; height: 1rem; accent-color: var(--live); }
.legend { display: flex; flex-wrap: wrap; gap: .5rem 1.1rem; margin: 0 0 1.25rem; padding: 0; list-style: none; font-family: var(--condensed); font-weight: 600; text-transform: uppercase; letter-spacing: .1em; font-size: .68rem; color: var(--ink); }
.legend li { display: flex; align-items: center; gap: .4rem; }
.legend-swatch { width: 10px; height: 10px; border: 1px solid var(--ink); background: var(--field, var(--muted)); display: inline-block; }

/* badges, pills and the starburst */
.badge-inst { display: inline-block; border: 1px solid var(--ink); color: var(--ink); font-family: var(--condensed); font-weight: 600; text-transform: uppercase; letter-spacing: .08em; font-size: .7rem; line-height: 1.4; padding: 0 .35rem; }
.pill-live { display: inline-block; background: var(--live); color: #fff; font-family: var(--condensed); font-weight: 700; text-transform: uppercase; letter-spacing: .1em; font-size: .68rem; line-height: 1.5; padding: 0 .4rem; }
.tag-now { display: inline-block; background: var(--live); color: #fff; font-family: var(--condensed); font-weight: 700; text-transform: uppercase; letter-spacing: .1em; font-size: .6rem; line-height: 1.5; padding: 0 .3rem; margin-left: .3rem; vertical-align: middle; }
.starburst { position: absolute; top: -1rem; right: 1.1rem; width: 78px; height: 78px; display: flex; align-items: center; justify-content: center; text-align: center; background: var(--yellow); color: var(--live); font-family: var(--display); font-size: .8rem; line-height: 1; text-transform: uppercase; transform: rotate(8deg); clip-path: polygon(50% 0%, 61% 12%, 76% 6%, 80% 21%, 95% 25%, 89% 39%, 100% 50%, 89% 61%, 95% 75%, 80% 79%, 76% 94%, 61% 88%, 50% 100%, 39% 88%, 24% 94%, 20% 79%, 5% 75%, 11% 61%, 0% 50%, 11% 39%, 5% 25%, 20% 21%, 24% 6%, 39% 12%); }

/* live strip and cards */
.live { position: relative; border: 2px solid var(--live); background: var(--card); margin: 0 0 1.4rem; }
.live-heading { display: flex; align-items: center; gap: .5rem; margin: 0; padding: .4rem .9rem; background: var(--live); color: #fff; font-family: var(--condensed); font-weight: 700; text-transform: uppercase; letter-spacing: .2em; font-size: .85rem; }
.live-heading::before { content: ''; width: 9px; height: 9px; border-radius: 50%; background: #fff; }
.live .card { margin: 0 .9rem; border-top: 1px solid var(--hairline); }
.live .card:first-of-type { border-top: 0; }
.card { padding: 1rem 0; border-top: 1px solid var(--hairline); }
.card-body { border-left: 3px solid var(--field, var(--muted)); padding-left: .75rem; }
.card-past .card-body { opacity: .82; }
.card-head { display: flex; align-items: baseline; gap: .6rem; flex-wrap: wrap; }
.card-time { font-family: var(--condensed); font-weight: 700; font-size: 1.5rem; letter-spacing: .01em; }
.card-time .time-viewer { font-family: var(--sans); font-weight: 400; font-size: .8rem; color: var(--muted); }
.card-candidate { margin: .35rem 0 0; font-size: 1.1rem; font-weight: 700; }
.card-candidate a { color: var(--ink); text-decoration: none; }
.card-candidate a:hover { color: var(--live); text-decoration: underline; }
.card-title { margin: .15rem 0 0; font-size: .9rem; line-height: 1.45; text-wrap: pretty; }
.card-meta { margin: .2rem 0 0; color: var(--muted); font-size: .82rem; }
.card-action { margin: .5rem 0 0; font-size: .9rem; }
.action { font-weight: 600; }
.action-secondary { font-weight: 400; margin-left: 1rem; }
.action-note, .status-muted { color: var(--muted); }
.time-viewer { color: var(--muted); }

/* toolbar and empty periods */
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: .75rem; flex-wrap: wrap; margin: 0 0 1.1rem; padding: .6rem .75rem; background: var(--yellow); color: var(--yellow-fg); border: 2px solid var(--ink); }
.toolbar-nav { display: flex; gap: .35rem; }
.toolbar button { cursor: pointer; background: #fff; color: #141210; border: 2px solid #141210; height: 1.9rem; padding: 0 .75rem; font-family: var(--condensed); text-transform: uppercase; letter-spacing: .1em; font-size: .75rem; font-weight: 600; }
.toolbar button.toolbar-step { width: 2rem; padding: 0; font-size: 1rem; letter-spacing: 0; }
.toolbar-period { font-family: var(--display); font-size: 1.5rem; letter-spacing: -.01em; text-transform: uppercase; }
.toolbar-views { display: flex; }
.toolbar-views button { margin-left: -2px; }
.toolbar-views button[aria-pressed="true"] { background: var(--live); color: #fff; }
.empty-period { margin: 0 0 1.1rem; padding: 1.1rem; border: 2px solid var(--ink); background: var(--card); }
.empty-period p { margin: 0; font-family: var(--display); font-size: 1.25rem; line-height: 1.1; text-transform: uppercase; letter-spacing: -.01em; }
.empty-period-links { display: flex; gap: 1.25rem; flex-wrap: wrap; margin-top: .5rem; font-size: .9rem; }

/* day view: a reversed bar marks the day break */
.day-view { border-top: 6px double var(--ink); padding-top: .6rem; }
.day-heading { margin: 0; padding: .4rem .6rem; background: var(--bar); color: var(--bar-fg); font-family: var(--condensed); font-weight: 600; font-size: .8rem; text-transform: uppercase; letter-spacing: .16em; }
.day-view .card { border-top: 0; border-bottom: 1px solid var(--hairline); }

/* week view */
.week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); border-left: 1px solid var(--hairline); }
.week-day { border-right: 1px solid var(--hairline); min-height: 14rem; }
.week-day-today { background: var(--today); }
.week-head { padding: .4rem .4rem .35rem; background: var(--bar); color: var(--bar-fg); }
.week-day-today .week-head { box-shadow: inset 0 0 0 2px var(--accent); }
.week-head-dow { font-family: var(--condensed); text-transform: uppercase; letter-spacing: .12em; font-size: .68rem; opacity: .75; }
.week-head-num { font-family: var(--condensed); font-weight: 700; font-size: 1.25rem; line-height: 1; }
.week-chips { padding: .4rem; display: flex; flex-direction: column; gap: .4rem; }

/* month view */
.month { border-top: 2px solid var(--ink); border-left: 1px solid var(--hairline); }
.month-dows, .month-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.month-dow { padding: .3rem .4rem; background: var(--bar); color: var(--bar-fg); border-right: 1px solid var(--hairline); font-family: var(--condensed); font-weight: 600; text-transform: uppercase; letter-spacing: .12em; font-size: .68rem; }
.month-cell { position: relative; border-right: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline); min-height: 6.1rem; padding: .3rem; }
.month-cell-pad .month-num { color: var(--muted); }
.month-cell-today { box-shadow: inset 0 0 0 2px var(--accent); background: var(--today); }
.month-num { font-family: var(--condensed); font-weight: 700; font-size: .95rem; line-height: 1; }
.month-chips { margin-top: .3rem; display: flex; flex-direction: column; gap: .25rem; }
.month-dots, .month-open { display: none; }

/* chips */
.chip { display: block; text-decoration: none; color: inherit; background: var(--chip); border: 1px solid var(--hairline); border-left: 3px solid var(--field, var(--muted)); padding: .3rem .4rem; }
.chip:hover { color: inherit; border-color: var(--ink); border-left-color: var(--field, var(--muted)); }
.chip-past { opacity: .55; }
.chip-head { display: flex; align-items: baseline; justify-content: space-between; gap: .35rem; }
.chip-time { font-family: var(--condensed); font-weight: 700; font-size: 1rem; line-height: 1.1; }
.chip-name { display: block; font-size: .78rem; font-weight: 600; line-height: 1.25; margin-top: .15rem; }
.chip-foot { display: block; margin-top: .25rem; }
.chip .badge-inst { font-size: .62rem; }
.chip-month .chip-time { font-size: .85rem; }
.chip-month .chip-name { font-size: .72rem; }

/* year view */
.year { display: grid; gap: 1.4rem; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.year-month-name { cursor: pointer; background: none; border: 0; border-bottom: 1px solid var(--ink); padding: 0 0 .2rem; width: 100%; text-align: left; color: var(--ink); font-family: var(--condensed); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; font-size: 1rem; }
.year-grid { margin-top: .4rem; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 2px; }
.year-dow { text-align: center; font-family: var(--condensed); font-size: .62rem; color: var(--muted); }
.year-day { border: 0; padding: 0; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: transparent; color: var(--muted); font-family: var(--condensed); font-size: .7rem; line-height: 1; }
.year-day-pad { visibility: hidden; }
.year-day-1 { background: var(--shade-1); color: var(--ink); cursor: pointer; }
.year-day-2 { background: var(--shade-2); color: var(--ink); cursor: pointer; }
.year-day-3 { background: var(--shade-3); color: var(--shade-3-fg); cursor: pointer; }
.year-caption { margin: .4rem 0 0; font-size: .78rem; color: var(--muted); }

/* defense page */
.defense { padding-top: 1.75rem; }
.defense-head { margin-bottom: 1.25rem; }
.defense-kicker { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; margin: 0 0 .5rem; }
.defense-candidate { margin: 0; color: var(--muted); font-size: 1rem; }
.defense-title { margin: .25rem 0 .5rem; font-family: var(--display); font-weight: 400; font-size: 1.9rem; line-height: 1.05; letter-spacing: -.02em; text-transform: uppercase; text-wrap: pretty; }
.defense-facts { display: grid; grid-template-columns: max-content 1fr; gap: .4rem 1.25rem; margin: 0 0 1.25rem; padding: .9rem 0; border-top: 2px solid var(--ink); border-bottom: 1px solid var(--hairline); }
.defense-facts dt { color: var(--muted); font-family: var(--condensed); font-weight: 600; text-transform: uppercase; letter-spacing: .1em; font-size: .75rem; padding-top: .15rem; }
.defense-facts dd { margin: 0; }
.defense-actions { margin: 0 0 1.5rem; }
.defense-abstract h2 { margin: 1.5rem 0 .5rem; padding: .35rem .6rem; background: var(--bar); color: var(--bar-fg); font-family: var(--condensed); font-weight: 600; text-transform: uppercase; letter-spacing: .16em; font-size: .8rem; }
.attribution { color: var(--muted); font-size: .9rem; border-top: 1px solid var(--hairline); padding-top: 1rem; }

/* narrow screens */
@media (max-width: 40rem) {
  .masthead-logo { font-size: 2.4rem; box-shadow: 4px 4px 0 var(--yellow); }
  .headlines { grid-template-columns: minmax(0, 1fr); }
  .page-title { font-size: 2.1rem; }
  .toolbar-period { font-size: 1.15rem; }
  .starburst { width: 64px; height: 64px; font-size: .68rem; }
  .week { display: block; border-left: 0; }
  .week-day { display: flex; gap: .75rem; min-height: 0; border-right: 0; border-top: 1px solid var(--hairline); padding: .5rem 0; }
  .week-head { min-width: 3.25rem; height: fit-content; }
  .week-chips { flex: 1; padding: 0; }
  .month-cell { min-height: 3.4rem; padding: .25rem; text-align: center; }
  .month-chips { display: none; }
  .month-dots { display: flex; gap: 3px; flex-wrap: wrap; justify-content: center; margin-top: .3rem; }
  .month-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--field, var(--muted)); }
  .month-dot-past { opacity: .55; }
  .month-open { display: block; position: absolute; inset: 0; background: transparent; border: 0; padding: 0; cursor: pointer; font-size: 0; color: transparent; }
  .year { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
```

- [ ] **Step 6: Run the tests, the type check and the real build**

Run: `/opt/homebrew/bin/npx vitest run test/components/Shell.test.tsx test/components/PageIntro.test.tsx test/site/pages.test.tsx && /opt/homebrew/bin/npm run typecheck && /opt/homebrew/bin/npm run build`
Expected: PASS; the build writes `dist/` and `ls dist/assets | grep -c woff2` is greater than 0 (the font files were bundled).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/styles/global.css src/components/Shell.tsx src/components/PageIntro.tsx src/site/pages.tsx test/components/Shell.test.tsx test/components/PageIntro.test.tsx test/site/pages.test.tsx
git commit -m "$(cat <<'EOF'
Restyle the site as a print TV guide: spot-ink tokens, self-hosted type, masthead band

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3dwE9qGamJauAbeBCZ3U2
EOF
)"
```

---

### Task 4: Chip, legend, card and filter bar

**Files:**
- Create: `src/components/DefenseChip.tsx`, `src/components/MajorFieldLegend.tsx`
- Modify: `src/components/DefenseCard.tsx`, `src/components/FilterBar.tsx`, `src/components/DefenseSchedule.tsx:60-62,68-74` (call sites only; the file goes in Task 8)
- Test: `test/components/DefenseChip.test.tsx`, `test/components/MajorFieldLegend.test.tsx`, `test/components/DefenseCard.test.tsx`

**Interfaces:**
- Consumes: `defensePhase`, `institutionLabel`, `majorField` from `src/lib/defense.ts`; `formatTime`, `zoneAbbreviation`, `Phase` from `src/lib/time.ts`.
- Produces: `DefenseChip({ defense, phase, zone, detail: 'week' | 'month' })`; `fieldClass(defense): string`; `chipTooltip(defense): string`; `MajorFieldLegend({ majors: MajorField[] })` with `interface MajorField { slug: string; name: string }`; `DefenseCard({ defense, phase, now, viewerZone })` (no `mode`); `FilterBar({ filters, disciplines, universities, onChange })` (no `showRecordedOnly`).

- [ ] **Step 1: Write the failing tests**

Create `test/components/DefenseChip.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { chipTooltip, DefenseChip, fieldClass } from '../../src/components/DefenseChip.tsx';
import { fixtureDefense } from '../fixtures/defenses.ts';

describe('DefenseChip', () => {
  const defense = fixtureDefense();

  it('links to the defense page with the time, the name and the institution badge in week detail', () => {
    render(<DefenseChip defense={defense} phase="upcoming" zone={null} detail="week" />);
    const link = screen.getByRole('link', { name: /Jane Doe/ });
    expect(link.getAttribute('href')).toBe('/defenses/2026/2026-09-15-tudelft-jane-doe/');
    expect(link.className).toContain('field-natural-sciences');
    expect(link.getAttribute('title')).toBe(
      'Learning to schedule under uncertainty · Delft University of Technology · 12:30 CEST · Computer and information sciences',
    );
    expect(screen.getByText('12:30')).toBeTruthy();
    expect(screen.getByText('TU Delft')).toBeTruthy();
    expect(screen.queryByText('Live')).toBeNull();
  });

  it('shows the time in the viewer zone once known', () => {
    render(<DefenseChip defense={defense} phase="upcoming" zone="America/New_York" detail="month" />);
    expect(screen.getByText('06:30')).toBeTruthy();
  });

  it('marks live and past chips and drops the badge in month detail', () => {
    const { container, rerender } = render(<DefenseChip defense={defense} phase="live" zone={null} detail="month" />);
    expect(screen.getByText('Live')).toBeTruthy();
    expect(screen.queryByText('TU Delft')).toBeNull();
    rerender(<DefenseChip defense={defense} phase="past" zone={null} detail="month" />);
    expect(container.querySelector('.chip-past')).toBeTruthy();
  });

  it('falls back to a neutral field class and a shorter tooltip without disciplines', () => {
    const bare = fixtureDefense({ disciplines: [] });
    expect(fieldClass(bare)).toBe('field-none');
    expect(chipTooltip(bare)).toBe('Learning to schedule under uncertainty · Delft University of Technology · 12:30 CEST');
  });
});
```

Create `test/components/MajorFieldLegend.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MajorFieldLegend } from '../../src/components/MajorFieldLegend.tsx';

describe('MajorFieldLegend', () => {
  it('lists one swatch per major field', () => {
    render(<MajorFieldLegend majors={[{ slug: 'natural-sciences', name: 'Natural sciences' }, { slug: 'social-sciences', name: 'Social sciences' }]} />);
    const items = within(screen.getByRole('list', { name: 'Major fields' })).getAllByRole('listitem');
    expect(items.map((i) => i.textContent)).toEqual(['Natural sciences', 'Social sciences']);
    expect(items[0]?.className).toBe('field-natural-sciences');
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<MajorFieldLegend majors={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
```

Create `test/components/DefenseCard.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DefenseCard } from '../../src/components/DefenseCard.tsx';
import { fixtureDefense } from '../fixtures/defenses.ts';

const NOW = new Date('2026-09-15T10:00:00Z');

describe('DefenseCard', () => {
  it('shows the stream link, the badge and the institution time for an upcoming defense', () => {
    render(<DefenseCard defense={fixtureDefense()} phase="upcoming" now={NOW} viewerZone={null} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Jane Doe' })).toBeTruthy();
    expect(screen.getByText('TU Delft')).toBeTruthy();
    expect(screen.getByText(/12:30/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Watch the livestream' })).toBeTruthy();
    expect(screen.queryByText('Live')).toBeNull();
  });

  it('marks a live defense and says when no stream link is known', () => {
    render(<DefenseCard defense={fixtureDefense({ stream: undefined })} phase="live" now={NOW} viewerZone={null} />);
    expect(screen.getByText('Live')).toBeTruthy();
    expect(screen.getByText('No stream link is known for this defense')).toBeTruthy();
  });

  it('shows recording status for a past defense', () => {
    const past = fixtureDefense({ startsAt: '2026-07-01T12:30:00+02:00', endsAt: '2026-07-01T11:30:00.000Z', recording: { url: 'https://youtu.be/rec', platform: 'youtube' } });
    render(<DefenseCard defense={past} phase="past" now={NOW} viewerZone={null} />);
    expect(screen.getByRole('link', { name: 'Watch the recording' }).getAttribute('href')).toBe('https://youtu.be/rec');
    expect(screen.queryByRole('link', { name: 'Watch the livestream' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `/opt/homebrew/bin/npx vitest run test/components/DefenseChip.test.tsx test/components/MajorFieldLegend.test.tsx test/components/DefenseCard.test.tsx`
Expected: FAIL — the two new modules do not exist; `DefenseCard` requires `mode` and renders no badge.

- [ ] **Step 3: Write the chip and the legend**

Create `src/components/DefenseChip.tsx`:

```tsx
import { institutionLabel, majorField, type Defense } from '../lib/defense.ts';
import { formatTime, zoneAbbreviation, type Phase } from '../lib/time.ts';

interface DefenseChipProps {
  defense: Defense;
  phase: Phase;
  /** Viewer zone once known; the institution zone is used until then. */
  zone: string | null;
  /** Week chips carry the institution badge; month chips are shorter. */
  detail: 'week' | 'month';
}

/** CSS class that sets the --field colour from the first discipline's major field. */
export function fieldClass(defense: Defense): string {
  const major = majorField(defense);
  return major ? `field-${major}` : 'field-none';
}

/** Title, institution, institution-local time and disciplines, for the chip's tooltip. */
export function chipTooltip(defense: Defense): string {
  const at = new Date(defense.startsAt);
  const parts = [defense.title, defense.university.name, `${formatTime(defense.startsAt, defense.timezone)} ${zoneAbbreviation(defense.timezone, at)}`];
  if (defense.disciplines.length > 0) parts.push(defense.disciplines.map((d) => d.name).join(', '));
  return parts.join(' · ');
}

/** Compact link to a defense page for the week and month grids. */
export function DefenseChip({ defense, phase, zone, detail }: DefenseChipProps) {
  return (
    <a className={`chip chip-${detail} chip-${phase} ${fieldClass(defense)}`} href={defense.url} title={chipTooltip(defense)}>
      <span className="chip-head">
        <span className="chip-time">{formatTime(defense.startsAt, zone ?? defense.timezone)}</span>
        {detail === 'week' && <span className="badge-inst">{institutionLabel(defense)}</span>}
        {detail === 'month' && phase === 'live' && <span className="pill-live">Live</span>}
      </span>
      <span className="chip-name">{defense.candidate}</span>
      {detail === 'week' && phase === 'live' && (
        <span className="chip-foot">
          <span className="pill-live">Live</span>
        </span>
      )}
    </a>
  );
}
```

Create `src/components/MajorFieldLegend.tsx`:

```tsx
export interface MajorField {
  slug: string;
  name: string;
}

/** One coloured square per major field; the colour comes from the field-<slug> class. */
export function MajorFieldLegend({ majors }: { majors: MajorField[] }) {
  if (majors.length === 0) return null;
  return (
    <ul className="legend" aria-label="Major fields">
      {majors.map((m) => (
        <li key={m.slug} className={`field-${m.slug}`}>
          <span className="legend-swatch" aria-hidden="true" />
          {m.name}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Rework the card and the filter bar**

Replace `src/components/DefenseCard.tsx` with:

```tsx
import { institutionLabel, type Defense } from '../lib/defense.ts';
import type { Phase } from '../lib/time.ts';
import { fieldClass } from './DefenseChip.tsx';
import { RecordingStatus } from './RecordingStatus.tsx';
import { TimeLabel } from './TimeLabel.tsx';

interface DefenseCardProps {
  defense: Defense;
  phase: Phase;
  now: Date;
  viewerZone: string | null;
}

function StreamStatus({ defense, phase }: { defense: Defense; phase: Phase }) {
  if (defense.stream) {
    return (
      <a className="action" href={defense.stream.url}>
        Watch the livestream
      </a>
    );
  }
  return (
    <span className="status status-muted">
      {phase === 'live' ? 'No stream link is known for this defense' : 'Stream link not yet announced'}
    </span>
  );
}

/** Full card for the day view and the live strip: past defenses show recording status, others the stream. */
export function DefenseCard({ defense, phase, now, viewerZone }: DefenseCardProps) {
  return (
    <article className={`card card-${phase} ${fieldClass(defense)}`}>
      <div className="card-body">
        <div className="card-head">
          <span className="card-time">
            <TimeLabel startsAt={defense.startsAt} timezone={defense.timezone} viewerZone={viewerZone} />
          </span>
          <span className="badge-inst">{institutionLabel(defense)}</span>
          {phase === 'live' && <span className="pill-live">Live</span>}
        </div>
        <h3 className="card-candidate">
          <a href={defense.url}>{defense.candidate}</a>
        </h3>
        <p className="card-title">{defense.title}</p>
        <p className="card-meta">
          {defense.university.name}
          {defense.faculty ? ` · ${defense.faculty}` : ''}
          {defense.disciplines.length > 0 ? ` · ${defense.disciplines.map((d) => d.name).join(', ')}` : ''}
        </p>
        <p className="card-action">
          {phase === 'past' ? <RecordingStatus defense={defense} now={now} /> : <StreamStatus defense={defense} phase={phase} />}
        </p>
      </div>
    </article>
  );
}
```

Replace `src/components/FilterBar.tsx` with:

```tsx
import type { Filters } from '../lib/filters.ts';

interface Option {
  slug: string;
  name: string;
}

interface FilterBarProps {
  filters: Filters;
  disciplines: Option[];
  universities: Option[];
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, disciplines, universities, onChange }: FilterBarProps) {
  const set = (patch: Partial<Filters>) => {
    const next: Filters = { ...filters, ...patch };
    if (!next.discipline) delete next.discipline;
    if (!next.university) delete next.university;
    if (!next.recordedOnly) delete next.recordedOnly;
    onChange(next);
  };
  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()}>
      <label>
        <span className="label">Discipline</span>
        <select value={filters.discipline ?? ''} onChange={(e) => set({ discipline: e.target.value })}>
          <option value="">All disciplines</option>
          {disciplines.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="label">Institution</span>
        <select value={filters.university ?? ''} onChange={(e) => set({ university: e.target.value })}>
          <option value="">All institutions</option>
          {universities.map((u) => (
            <option key={u.slug} value={u.slug}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
      <label className="filters-check">
        <input type="checkbox" checked={filters.recordedOnly ?? false} onChange={(e) => set({ recordedOnly: e.target.checked })} />
        Only defenses with a recording
      </label>
    </form>
  );
}
```

In `src/components/DefenseSchedule.tsx` (still alive until Task 8), make its two call sites compile: change the `card` helper to

```tsx
  const card = (item: { defense: Defense; phase: ReturnType<typeof classify> }) => (
    <DefenseCard key={item.defense.key} defense={item.defense} phase={item.phase} now={now} viewerZone={clock.zone} />
  );
```

and remove the `showRecordedOnly={mode === 'archive'}` line from its `<FilterBar … />`.

- [ ] **Step 5: Run the component tests and the type check**

Run: `/opt/homebrew/bin/npx vitest run test/components && /opt/homebrew/bin/npm run typecheck`
Expected: PASS, including the old `DefenseSchedule` tests.

- [ ] **Step 6: Commit**

```bash
git add src/components test/components
git commit -m "$(cat <<'EOF'
Add the defense chip and the major-field legend; rework the card and filter bar

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3dwE9qGamJauAbeBCZ3U2
EOF
)"
```

---

### Task 5: Toolbar, empty period and headline strip

**Files:**
- Create: `src/components/CalendarToolbar.tsx`, `src/components/EmptyPeriod.tsx`, `src/components/HeadlineStrip.tsx`
- Test: `test/components/CalendarToolbar.test.tsx`, `test/components/EmptyPeriod.test.tsx`, `test/components/HeadlineStrip.test.tsx`

**Interfaces:**
- Consumes: `CALENDAR_VIEWS`, `periodLabel`, `shift`, `periodBounds`, `nearestDate`, `formatDateString`, `CalendarState`, `CalendarView`, `DateString` from `src/lib/calendar.ts`; `defensePhase`, `institutionLabel`, `Defense` from `src/lib/defense.ts`; `formatDate` from `src/lib/time.ts`.
- Produces: `CalendarToolbar({ state, today, onChange: (next: CalendarState) => void })`; `EmptyPeriod({ state, dates: Iterable<DateString>, onJump: (date: DateString) => void })`; `emptyMessage(state): string`; `HeadlineStrip({ defenses, now, zone: string | null })`; `headlines(defenses, now, zone): Headline[]` with `interface Headline { kind: 'live' | 'upcoming' | 'recordings'; kicker: string; text: string }`.

- [ ] **Step 1: Write the failing tests**

Create `test/components/CalendarToolbar.test.tsx`:

```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalendarToolbar } from '../../src/components/CalendarToolbar.tsx';

describe('CalendarToolbar', () => {
  const state = { view: 'month' as const, date: '2026-09-15' };

  it('shows the period label and marks the active view', () => {
    render(<CalendarToolbar state={state} today="2026-09-07" onChange={() => {}} />);
    expect(screen.getByText('September 2026')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Month', pressed: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Week', pressed: false })).toBeTruthy();
  });

  it('steps by one unit of the view, jumps to today and switches views keeping the date', () => {
    const onChange = vi.fn();
    render(<CalendarToolbar state={state} today="2026-09-07" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(onChange).toHaveBeenLastCalledWith({ view: 'month', date: '2026-10-15' });
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(onChange).toHaveBeenLastCalledWith({ view: 'month', date: '2026-08-15' });
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenLastCalledWith({ view: 'month', date: '2026-09-07' });
    fireEvent.click(screen.getByRole('button', { name: 'Week' }));
    expect(onChange).toHaveBeenLastCalledWith({ view: 'week', date: '2026-09-15' });
  });

  it('names the step buttons after the view', () => {
    render(<CalendarToolbar state={{ view: 'year', date: '2026-09-15' }} today="2026-09-07" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next year' })).toBeTruthy();
    expect(screen.getByText('2026')).toBeTruthy();
  });
});
```

Create `test/components/EmptyPeriod.test.tsx`:

```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyPeriod, emptyMessage } from '../../src/components/EmptyPeriod.tsx';

const dates = ['2026-07-01', '2026-09-16', '2026-10-02'];

describe('EmptyPeriod', () => {
  it('names the empty period per view', () => {
    expect(emptyMessage({ view: 'day', date: '2026-09-22' })).toBe('No defenses on Tue 22 Sep 2026.');
    expect(emptyMessage({ view: 'week', date: '2026-09-22' })).toBe('No defenses this week.');
    expect(emptyMessage({ view: 'month', date: '2026-11-03' })).toBe('No defenses in November 2026.');
  });

  it('offers the nearest defense before and after the period', () => {
    const onJump = vi.fn();
    render(<EmptyPeriod state={{ view: 'week', date: '2026-09-22' }} dates={dates} onJump={onJump} />);
    expect(screen.getByRole('status').textContent).toContain('No defenses this week.');
    fireEvent.click(screen.getByRole('button', { name: 'Previous: Wed 16 Sep 2026' }));
    expect(onJump).toHaveBeenLastCalledWith('2026-09-16');
    fireEvent.click(screen.getByRole('button', { name: 'Next: Fri 2 Oct 2026' }));
    expect(onJump).toHaveBeenLastCalledWith('2026-10-02');
  });

  it('omits a direction with nothing in it', () => {
    render(<EmptyPeriod state={{ view: 'month', date: '2026-11-03' }} dates={dates} onJump={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous: Fri 2 Oct 2026' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Next/ })).toBeNull();
  });
});
```

Create `test/components/HeadlineStrip.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { headlines, HeadlineStrip } from '../../src/components/HeadlineStrip.tsx';
import { fixtureDefense, type DefenseOverrides } from '../fixtures/defenses.ts';

const NOW = new Date('2026-09-07T11:20:00Z');
const at = (key: string, candidate: string, startsAt: string, extra: DefenseOverrides = {}) =>
  fixtureDefense({ key, candidate, startsAt, endsAt: new Date(new Date(startsAt).getTime() + 3_600_000).toISOString(), timezone: 'Europe/Amsterdam', durationMinutes: 60, ...extra });
const live = at('live', 'Live Person', '2026-09-07T13:00:00+02:00', { university: { slug: 'kth', name: 'KTH Royal Institute of Technology', shortName: 'KTH', country: 'SE' } });
const wed = at('wed', 'Wed Person', '2026-09-09T09:00:00+02:00');
const october = at('october', 'October Person', '2026-10-02T12:15:00+02:00');
const past = at('past', 'Past Person', '2026-07-01T11:00:00+02:00', { recording: { url: 'https://youtu.be/rec', platform: 'youtube' } });

describe('headlines', () => {
  it('leads with the defense on air, then counts what is still to come and what can be caught up', () => {
    expect(headlines([live, wed, october, past], NOW, 'Europe/Amsterdam')).toEqual([
      { kind: 'live', kicker: 'On air now', text: 'Live Person defends at KTH!' },
      { kind: 'upcoming', kicker: 'Coming up', text: '2 defenses you can still catch live' },
      { kind: 'recordings', kicker: 'Catch-up', text: '1 recording ready to watch' },
    ]);
  });

  it('names the next defense when nothing is on air, with singular counts', () => {
    expect(headlines([wed, past], NOW, 'Europe/Amsterdam')[0]).toEqual({ kind: 'live', kicker: 'Next up', text: 'Wed Person at TU Delft on Wed 9 Sep 2026' });
    expect(headlines([wed, past], NOW, 'Europe/Amsterdam')[1]?.text).toBe('1 defense you can still catch live');
  });

  it('copes with an empty dataset', () => {
    expect(headlines([], NOW, null).map((h) => h.text)).toEqual(['No defenses scheduled yet', '0 defenses you can still catch live', '0 recordings ready to watch']);
  });
});

describe('HeadlineStrip', () => {
  it('renders the three headlines as a list with one class per kind', () => {
    render(<HeadlineStrip defenses={[live, wed, past]} now={NOW} zone="Europe/Amsterdam" />);
    const items = within(screen.getByRole('list', { name: 'Headlines' })).getAllByRole('listitem');
    expect(items.map((i) => i.className)).toEqual(['headline headline-live', 'headline headline-upcoming', 'headline headline-recordings']);
    expect(items[0]?.textContent).toBe('On air nowLive Person defends at KTH!');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `/opt/homebrew/bin/npx vitest run test/components/CalendarToolbar.test.tsx test/components/EmptyPeriod.test.tsx test/components/HeadlineStrip.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the toolbar**

Create `src/components/CalendarToolbar.tsx`:

```tsx
import { CALENDAR_VIEWS, periodLabel, shift, type CalendarState, type CalendarView, type DateString } from '../lib/calendar.ts';

interface CalendarToolbarProps {
  state: CalendarState;
  today: DateString;
  onChange: (next: CalendarState) => void;
}

const VIEW_LABELS: Record<CalendarView, string> = { day: 'Day', week: 'Week', month: 'Month', year: 'Year' };

/** Previous, next and Today; the period label; the view switcher. Switching views keeps the anchor date. */
export function CalendarToolbar({ state, today, onChange }: CalendarToolbarProps) {
  const step = (delta: -1 | 1) => onChange({ ...state, date: shift(state.date, state.view, delta) });
  return (
    <div className="toolbar">
      <div className="toolbar-nav">
        <button type="button" className="toolbar-step" aria-label={`Previous ${state.view}`} onClick={() => step(-1)}>
          ‹
        </button>
        <button type="button" className="toolbar-step" aria-label={`Next ${state.view}`} onClick={() => step(1)}>
          ›
        </button>
        <button type="button" onClick={() => onChange({ ...state, date: today })}>
          Today
        </button>
      </div>
      <span className="toolbar-period">{periodLabel(state.view, state.date)}</span>
      <div className="toolbar-views" role="group" aria-label="View">
        {CALENDAR_VIEWS.map((view) => (
          <button key={view} type="button" aria-pressed={view === state.view} onClick={() => onChange({ ...state, view })}>
            {VIEW_LABELS[view]}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write the empty period**

Create `src/components/EmptyPeriod.tsx`:

```tsx
import { formatDateString, nearestDate, periodBounds, periodLabel, type CalendarState, type DateString } from '../lib/calendar.ts';

interface EmptyPeriodProps {
  state: CalendarState;
  /** Every date that has a defense under the current filters. */
  dates: Iterable<DateString>;
  onJump: (date: DateString) => void;
}

export function emptyMessage(state: CalendarState): string {
  switch (state.view) {
    case 'day':
      return `No defenses on ${formatDateString(state.date)}.`;
    case 'week':
      return 'No defenses this week.';
    case 'month':
      return `No defenses in ${periodLabel('month', state.date)}.`;
    case 'year':
      return `No defenses in ${periodLabel('year', state.date)}.`;
  }
}

/** The empty-period sentence with jumps to the nearest defense before and after, when there is one. */
export function EmptyPeriod({ state, dates, onJump }: EmptyPeriodProps) {
  const bounds = periodBounds(state.view, state.date);
  const list = [...dates];
  const previous = nearestDate(list, bounds, -1);
  const next = nearestDate(list, bounds, 1);
  return (
    <div className="empty-period" role="status">
      <p>{emptyMessage(state)}</p>
      {(previous || next) && (
        <div className="empty-period-links">
          {previous && (
            <button type="button" className="link-button" onClick={() => onJump(previous)}>
              Previous: {formatDateString(previous)}
            </button>
          )}
          {next && (
            <button type="button" className="link-button" onClick={() => onJump(next)}>
              Next: {formatDateString(next)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Write the headline strip**

Create `src/components/HeadlineStrip.tsx`:

```tsx
import { defensePhase, institutionLabel, type Defense } from '../lib/defense.ts';
import { formatDate } from '../lib/time.ts';

interface HeadlineStripProps {
  /** Every published defense: the headlines describe the whole listing, not the filtered view. */
  defenses: Defense[];
  now: Date;
  /** Viewer zone once known, for the date of the next defense. */
  zone: string | null;
}

export interface Headline {
  kind: 'live' | 'upcoming' | 'recordings';
  kicker: string;
  text: string;
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** What is on air (or next), how many defenses are still to come, how many recordings exist. */
export function headlines(defenses: Defense[], now: Date, zone: string | null): Headline[] {
  const byStart = [...defenses].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const live = byStart.find((d) => defensePhase(d, now) === 'live');
  const upcoming = byStart.filter((d) => defensePhase(d, now) === 'upcoming');
  const recordings = defenses.filter((d) => d.recording !== undefined && 'url' in d.recording).length;
  const next = upcoming[0];
  const first: Headline = live
    ? { kind: 'live', kicker: 'On air now', text: `${live.candidate} defends at ${institutionLabel(live)}!` }
    : next
      ? { kind: 'live', kicker: 'Next up', text: `${next.candidate} at ${institutionLabel(next)} on ${formatDate(next.startsAt, zone ?? next.timezone)}` }
      : { kind: 'live', kicker: 'Next up', text: 'No defenses scheduled yet' };
  return [
    first,
    { kind: 'upcoming', kicker: 'Coming up', text: `${count(upcoming.length, 'defense', 'defenses')} you can still catch live` },
    { kind: 'recordings', kicker: 'Catch-up', text: `${count(recordings, 'recording', 'recordings')} ready to watch` },
  ];
}

/** The three spot-colour blurbs under the masthead, continuing its band across the full width. */
export function HeadlineStrip({ defenses, now, zone }: HeadlineStripProps) {
  return (
    <div className="headlines-band">
      <ul className="column headlines" aria-label="Headlines">
        {headlines(defenses, now, zone).map((h) => (
          <li key={h.kind} className={`headline headline-${h.kind}`}>
            <span className="headline-kicker">{h.kicker}</span>
            <span className="headline-text">{h.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 6: Run the tests**

Run: `/opt/homebrew/bin/npx vitest run test/components/CalendarToolbar.test.tsx test/components/EmptyPeriod.test.tsx test/components/HeadlineStrip.test.tsx && /opt/homebrew/bin/npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/CalendarToolbar.tsx src/components/EmptyPeriod.tsx src/components/HeadlineStrip.tsx test/components/CalendarToolbar.test.tsx test/components/EmptyPeriod.test.tsx test/components/HeadlineStrip.test.tsx
git commit -m "$(cat <<'EOF'
Add the calendar toolbar, the empty-period jump links and the headline strip

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3dwE9qGamJauAbeBCZ3U2
EOF
)"
```

---

### Task 6: Day and week views

**Files:**
- Create: `src/components/DayView.tsx`, `src/components/WeekView.tsx`
- Test: `test/components/DayView.test.tsx`, `test/components/WeekView.test.tsx`

**Interfaces:**
- Consumes: `DefenseCard`, `DefenseChip`; `daysOfWeek`, `formatDateLong`, `formatDateString`, `WEEKDAYS_SHORT`, `groupByDate` from `src/lib/calendar.ts`; `defensePhase` from `src/lib/defense.ts`.
- Produces: `DayView({ date, defenses, now, zone })`; `WeekView({ date, groups, today, now, zone })`.

- [ ] **Step 1: Write the failing tests**

Create `test/components/DayView.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DayView } from '../../src/components/DayView.tsx';
import { fixtureDefense } from '../fixtures/defenses.ts';

const NOW = new Date('2026-09-15T10:00:00Z');
const first = fixtureDefense({ key: 'a', candidate: 'First Person', startsAt: '2026-09-15T09:00:00+02:00', endsAt: '2026-09-15T08:00:00.000Z' });
const second = fixtureDefense({ key: 'b', candidate: 'Second Person', startsAt: '2026-09-15T12:30:00+02:00', endsAt: '2026-09-15T11:30:00.000Z' });

describe('DayView', () => {
  it('heads with the date spelled out and lists the cards in order', () => {
    render(<DayView date="2026-09-15" defenses={[first, second]} now={NOW} zone={null} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Tuesday 15 September 2026' })).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['First Person', 'Second Person']);
  });

  it('gives each card the phase for the clock', () => {
    render(<DayView date="2026-09-15" defenses={[first, second]} now={NOW} zone={null} />);
    expect(screen.getByText('Recording not yet available')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Watch the livestream' })).toBeTruthy();
  });
});
```

Create `test/components/WeekView.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeekView } from '../../src/components/WeekView.tsx';
import { groupByDate } from '../../src/lib/calendar.ts';
import { fixtureDefense } from '../fixtures/defenses.ts';

const NOW = new Date('2026-09-07T11:20:00Z');
const monday = fixtureDefense({ key: 'mon', candidate: 'Monday Person', startsAt: '2026-09-07T13:00:00+02:00', endsAt: '2026-09-07T12:00:00.000Z' });
const wednesday = fixtureDefense({ key: 'wed', candidate: 'Wednesday Person', startsAt: '2026-09-09T09:00:00+02:00', endsAt: '2026-09-09T08:00:00.000Z' });
const groups = groupByDate([monday, wednesday], 'Europe/Amsterdam');

describe('WeekView', () => {
  it('renders seven Monday-start columns with the chips in the right days', () => {
    render(<WeekView date="2026-09-09" groups={groups} today="2026-09-07" now={NOW} zone="Europe/Amsterdam" />);
    const days = screen.getAllByRole('region');
    expect(days.map((d) => d.getAttribute('aria-label'))).toEqual([
      'Mon 7 Sep 2026', 'Tue 8 Sep 2026', 'Wed 9 Sep 2026', 'Thu 10 Sep 2026', 'Fri 11 Sep 2026', 'Sat 12 Sep 2026', 'Sun 13 Sep 2026',
    ]);
    expect(within(days[2] as HTMLElement).getByRole('link', { name: /Wednesday Person/ })).toBeTruthy();
    expect(within(days[1] as HTMLElement).queryByRole('link')).toBeNull();
  });

  it('marks today with the NOW tag and a live chip', () => {
    render(<WeekView date="2026-09-09" groups={groups} today="2026-09-07" now={NOW} zone="Europe/Amsterdam" />);
    const today = screen.getByRole('region', { name: 'Mon 7 Sep 2026' });
    expect(today.className).toContain('week-day-today');
    expect(within(today).getByText('Now')).toBeTruthy();
    expect(within(today).getByText('Live')).toBeTruthy();
    expect(within(today).getByText('TU Delft')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `/opt/homebrew/bin/npx vitest run test/components/DayView.test.tsx test/components/WeekView.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the day view**

Create `src/components/DayView.tsx`:

```tsx
import { formatDateLong, type DateString } from '../lib/calendar.ts';
import { defensePhase, type Defense } from '../lib/defense.ts';
import { DefenseCard } from './DefenseCard.tsx';

interface DayViewProps {
  date: DateString;
  /** The defenses of that day, already sorted by start. */
  defenses: Defense[];
  now: Date;
  zone: string | null;
}

/** One day: the date spelled out, then full cards. The parent renders the empty state instead when there is nothing. */
export function DayView({ date, defenses, now, zone }: DayViewProps) {
  return (
    <section className="day-view">
      <h2 className="day-heading">{formatDateLong(date)}</h2>
      {defenses.map((d) => (
        <DefenseCard key={d.key} defense={d} phase={defensePhase(d, now)} now={now} viewerZone={zone} />
      ))}
    </section>
  );
}
```

- [ ] **Step 4: Write the week view**

Create `src/components/WeekView.tsx`:

```tsx
import { daysOfWeek, formatDateString, WEEKDAYS_SHORT, type DateString } from '../lib/calendar.ts';
import { defensePhase, type Defense } from '../lib/defense.ts';
import { DefenseChip } from './DefenseChip.tsx';

interface WeekViewProps {
  date: DateString;
  groups: Map<DateString, Defense[]>;
  today: DateString;
  now: Date;
  zone: string | null;
}

/** Seven Monday-start columns of chips; today's header carries the NOW tag. */
export function WeekView({ date, groups, today, now, zone }: WeekViewProps) {
  return (
    <div className="week">
      {daysOfWeek(date).map((day, i) => {
        const isToday = day === today;
        return (
          <section key={day} className={`week-day${isToday ? ' week-day-today' : ''}`} aria-label={formatDateString(day)}>
            <div className="week-head">
              <div className="week-head-dow">{WEEKDAYS_SHORT[i]}</div>
              <div className="week-head-num">
                {Number(day.slice(8))}
                {isToday && <span className="tag-now">Now</span>}
              </div>
            </div>
            <div className="week-chips">
              {(groups.get(day) ?? []).map((d) => (
                <DefenseChip key={d.key} defense={d} phase={defensePhase(d, now)} zone={zone} detail="week" />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Run the tests**

Run: `/opt/homebrew/bin/npx vitest run test/components/DayView.test.tsx test/components/WeekView.test.tsx && /opt/homebrew/bin/npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/DayView.tsx src/components/WeekView.tsx test/components/DayView.test.tsx test/components/WeekView.test.tsx
git commit -m "$(cat <<'EOF'
Add the day and week views

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3dwE9qGamJauAbeBCZ3U2
EOF
)"
```

---

### Task 7: Month and year views

**Files:**
- Create: `src/components/MonthView.tsx`, `src/components/YearView.tsx`
- Test: `test/components/MonthView.test.tsx`, `test/components/YearView.test.tsx`

**Interfaces:**
- Consumes: `DefenseChip`, `fieldClass`; `weeksOfMonth`, `monthsOfYear`, `sameMonth`, `formatDateString`, `WEEKDAYS_SHORT`, `MONTHS` from `src/lib/calendar.ts`; `defensePhase`.
- Produces: `MonthView({ date, groups, today, now, zone, onOpenDay })`; `YearView({ date, groups, onOpenMonth, onOpenDay })`; `shadeLevel(count): 0 | 1 | 2 | 3`.

- [ ] **Step 1: Write the failing tests**

Create `test/components/MonthView.test.tsx`:

```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MonthView } from '../../src/components/MonthView.tsx';
import { groupByDate } from '../../src/lib/calendar.ts';
import { fixtureDefense } from '../fixtures/defenses.ts';

const NOW = new Date('2026-09-07T11:20:00Z');
const seventh = fixtureDefense({ key: 'a', candidate: 'Seventh Person', startsAt: '2026-09-07T13:00:00+02:00', endsAt: '2026-09-07T12:00:00.000Z' });
const past = fixtureDefense({ key: 'b', candidate: 'August Person', startsAt: '2026-08-31T12:00:00+02:00', endsAt: '2026-08-31T11:00:00.000Z' });
const groups = groupByDate([seventh, past], 'Europe/Amsterdam');

describe('MonthView', () => {
  it('lays out September 2026 as five Monday-start rows with padding days', () => {
    const { container } = render(<MonthView date="2026-09-15" groups={groups} today="2026-09-07" now={NOW} zone="Europe/Amsterdam" onOpenDay={() => {}} />);
    const cells = container.querySelectorAll('.month-cell');
    expect(cells).toHaveLength(35);
    expect(cells[0]?.className).toContain('month-cell-pad');
    expect(cells[0]?.querySelector('.month-num')?.textContent).toBe('31');
    expect(cells[7]?.className).toContain('month-cell-today');
    expect(cells[34]?.querySelector('.month-num')?.textContent).toBe('4');
  });

  it('keeps chips on padding days and opens a day from its cell', () => {
    const onOpenDay = vi.fn();
    render(<MonthView date="2026-09-15" groups={groups} today="2026-09-07" now={NOW} zone="Europe/Amsterdam" onOpenDay={onOpenDay} />);
    expect(screen.getByRole('link', { name: /August Person/ }).className).toContain('chip-past');
    expect(screen.getByRole('link', { name: /Seventh Person/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open Mon 7 Sep 2026' }));
    expect(onOpenDay).toHaveBeenCalledWith('2026-09-07');
    expect(screen.queryByRole('button', { name: 'Open Tue 8 Sep 2026' })).toBeNull();
  });
});
```

Create `test/components/YearView.test.tsx`:

```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { shadeLevel, YearView } from '../../src/components/YearView.tsx';
import { groupByDate } from '../../src/lib/calendar.ts';
import { fixtureDefense } from '../fixtures/defenses.ts';

const one = (key: string, startsAt: string) => fixtureDefense({ key, startsAt, endsAt: new Date(new Date(startsAt).getTime() + 3_600_000).toISOString() });
const groups = groupByDate(
  [one('a', '2026-09-07T13:00:00+02:00'), one('b', '2026-09-24T10:30:00+02:00'), one('c', '2026-09-24T16:30:00+02:00'), one('d', '2026-07-01T11:00:00+02:00')],
  'Europe/Amsterdam',
);

describe('YearView', () => {
  it('shows twelve six-row mini-months with counts', () => {
    const { container } = render(<YearView date="2026-09-15" groups={groups} onOpenMonth={() => {}} onOpenDay={() => {}} />);
    const months = screen.getAllByRole('region');
    expect(months).toHaveLength(12);
    expect(months[0]?.getAttribute('aria-label')).toBe('January 2026');
    expect(container.querySelectorAll('.year-month:first-child .year-day')).toHaveLength(42);
    expect(within(months[8] as HTMLElement).getByText('3 defenses')).toBeTruthy();
    expect(within(months[6] as HTMLElement).getByText('1 defense')).toBeTruthy();
    expect(within(months[0] as HTMLElement).getByText('0 defenses')).toBeTruthy();
  });

  it('shades days by count and opens a month or a day', () => {
    const onOpenMonth = vi.fn();
    const onOpenDay = vi.fn();
    render(<YearView date="2026-09-15" groups={groups} onOpenMonth={onOpenMonth} onOpenDay={onOpenDay} />);
    const day = screen.getByRole('button', { name: 'Thu 24 Sep 2026, 2 defenses' });
    expect(day.className).toContain('year-day-2');
    fireEvent.click(day);
    expect(onOpenDay).toHaveBeenCalledWith('2026-09-24');
    fireEvent.click(screen.getByRole('button', { name: 'September' }));
    expect(onOpenMonth).toHaveBeenCalledWith('2026-09-01');
    expect(screen.queryByRole('button', { name: /Tue 8 Sep 2026/ })).toBeNull();
    expect(shadeLevel(0)).toBe(0);
    expect(shadeLevel(5)).toBe(3);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `/opt/homebrew/bin/npx vitest run test/components/MonthView.test.tsx test/components/YearView.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the month view**

Create `src/components/MonthView.tsx`:

```tsx
import { formatDateString, sameMonth, WEEKDAYS_SHORT, weeksOfMonth, type DateString } from '../lib/calendar.ts';
import { defensePhase, type Defense } from '../lib/defense.ts';
import { DefenseChip, fieldClass } from './DefenseChip.tsx';

interface MonthViewProps {
  date: DateString;
  groups: Map<DateString, Defense[]>;
  today: DateString;
  now: Date;
  zone: string | null;
  /** Narrow screens show dots instead of chips; tapping such a cell opens the day. */
  onOpenDay: (date: DateString) => void;
}

/** A Monday-start grid covering the month; padding days from the neighbours are dimmed but keep their chips. */
export function MonthView({ date, groups, today, now, zone, onOpenDay }: MonthViewProps) {
  return (
    <div className="month">
      <div className="month-dows" aria-hidden="true">
        {WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="month-dow">
            {d}
          </div>
        ))}
      </div>
      <div className="month-grid">
        {weeksOfMonth(date)
          .flat()
          .map((day) => {
            const items = groups.get(day) ?? [];
            const classes = ['month-cell', sameMonth(day, date) ? '' : 'month-cell-pad', day === today ? 'month-cell-today' : '']
              .filter(Boolean)
              .join(' ');
            return (
              <div key={day} className={classes}>
                <div className="month-num">{Number(day.slice(8))}</div>
                <div className="month-chips">
                  {items.map((d) => (
                    <DefenseChip key={d.key} defense={d} phase={defensePhase(d, now)} zone={zone} detail="month" />
                  ))}
                </div>
                {items.length > 0 && (
                  <>
                    <div className="month-dots" aria-hidden="true">
                      {items.map((d) => (
                        <span key={d.key} className={`month-dot ${fieldClass(d)}${defensePhase(d, now) === 'past' ? ' month-dot-past' : ''}`} />
                      ))}
                    </div>
                    <button type="button" className="month-open" aria-label={`Open ${formatDateString(day)}`} onClick={() => onOpenDay(day)}>
                      Open
                    </button>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write the year view**

Create `src/components/YearView.tsx`:

```tsx
import { formatDateString, MONTHS, monthsOfYear, sameMonth, weeksOfMonth, type DateString } from '../lib/calendar.ts';
import type { Defense } from '../lib/defense.ts';

interface YearViewProps {
  date: DateString;
  groups: Map<DateString, Defense[]>;
  onOpenMonth: (firstOfMonth: DateString) => void;
  onOpenDay: (date: DateString) => void;
}

const DOW_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Shading step for a day: none, one, two, three or more. */
export function shadeLevel(count: number): 0 | 1 | 2 | 3 {
  if (count >= 3) return 3;
  if (count === 2) return 2;
  return count === 1 ? 1 : 0;
}

const plural = (n: number) => `${n} ${n === 1 ? 'defense' : 'defenses'}`;

/** Twelve mini-months, six rows each, with days shaded by count; names open the month, shaded days open the day. */
export function YearView({ date, groups, onOpenMonth, onOpenDay }: YearViewProps) {
  return (
    <div className="year">
      {monthsOfYear(date).map((first) => {
        const cells = weeksOfMonth(first, 6).flat();
        const count = cells.filter((day) => sameMonth(day, first)).reduce((sum, day) => sum + (groups.get(day)?.length ?? 0), 0);
        const name = MONTHS[Number(first.slice(5, 7)) - 1] ?? '';
        return (
          <section key={first} className="year-month" aria-label={`${name} ${first.slice(0, 4)}`}>
            <button type="button" className="year-month-name" onClick={() => onOpenMonth(first)}>
              {name}
            </button>
            <div className="year-grid">
              {DOW_INITIALS.map((d, i) => (
                <div key={i} className="year-dow" aria-hidden="true">
                  {d}
                </div>
              ))}
              {cells.map((day) => {
                if (!sameMonth(day, first)) return <span key={day} className="year-day year-day-pad" aria-hidden="true" />;
                const n = groups.get(day)?.length ?? 0;
                const number = Number(day.slice(8));
                if (n === 0) {
                  return (
                    <span key={day} className="year-day year-day-0">
                      {number}
                    </span>
                  );
                }
                return (
                  <button
                    key={day}
                    type="button"
                    className={`year-day year-day-${shadeLevel(n)}`}
                    aria-label={`${formatDateString(day)}, ${plural(n)}`}
                    onClick={() => onOpenDay(day)}
                  >
                    {number}
                  </button>
                );
              })}
            </div>
            <p className="year-caption">{plural(count)}</p>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Run the tests**

Run: `/opt/homebrew/bin/npx vitest run test/components/MonthView.test.tsx test/components/YearView.test.tsx && /opt/homebrew/bin/npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/MonthView.tsx src/components/YearView.tsx test/components/MonthView.test.tsx test/components/YearView.test.tsx
git commit -m "$(cat <<'EOF'
Add the month and year views

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3dwE9qGamJauAbeBCZ3U2
EOF
)"
```

---

### Task 8: The calendar island, wired into the site

**Files:**
- Create: `src/components/DefenseCalendar.tsx`, `src/site/client/calendar.tsx`
- Modify: `src/site/assets.ts`, `src/site/document.tsx`, `src/site/pages.tsx`, `src/site/generate.ts`
- Delete: `src/components/DefenseSchedule.tsx`, `src/site/client/schedule.tsx`, `test/components/DefenseSchedule.test.tsx`
- Modify: `test/site/pages.test.tsx`, `test/build/site.test.ts`, `test/site/islands.test.tsx`, `test/site/assets.test.ts`
- Test: `test/components/DefenseCalendar.test.tsx`

**Interfaces:**
- Consumes: everything from Tasks 1 to 7, including `HeadlineStrip({ defenses, now, zone })` and `PageIntro({ kicker, title, highlight, lede })`.
- Produces: `DefenseCalendar({ defenses, majors, renderedAt? })` and `DefenseCalendarProps`; `ISLAND_ENTRIES.DefenseCalendar`; `Document` prop `refresh?: string`; `homePage({ defenses, majors }, context)`; `archiveRedirectPage(context)`. The island renders the whole home page below the masthead: the headline strip (full width), then a column with the page intro, the filters, the legend, the live strip, the toolbar and the active view.

- [ ] **Step 1: Write the failing island test**

Create `test/components/DefenseCalendar.test.tsx`:

```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DefenseCalendar } from '../../src/components/DefenseCalendar.tsx';
import { fixtureDefense, type DefenseOverrides } from '../fixtures/defenses.ts';

// The clock is Monday 7 September 2026, 13:20 in Amsterdam; the viewer sits in Amsterdam unless a test says otherwise.
process.env['TZ'] = 'Europe/Amsterdam';
const NOW = new Date('2026-09-07T11:20:00Z');
const RENDERED_AT = NOW.toISOString();
const MAJORS = [
  { slug: 'natural-sciences', name: 'Natural sciences' },
  { slug: 'engineering-and-technology', name: 'Engineering and technology' },
  { slug: 'agricultural-and-veterinary-sciences', name: 'Agricultural and veterinary sciences' },
  { slug: 'social-sciences', name: 'Social sciences' },
];

const at = (key: string, candidate: string, startsAt: string, extra: DefenseOverrides = {}) =>
  fixtureDefense({
    key,
    url: `/defenses/${key}/`,
    candidate,
    startsAt,
    endsAt: new Date(new Date(startsAt).getTime() + 3_600_000).toISOString(),
    timezone: 'Europe/Amsterdam',
    durationMinutes: 60,
    ...extra,
  });
const live = at('live', 'Live Person', '2026-09-07T13:00:00+02:00', {
  university: { slug: 'kth', name: 'KTH Royal Institute of Technology', shortName: 'KTH', country: 'SE' },
  disciplines: [{ slug: 'electrical-electronic-and-information-engineering', name: 'Electrical engineering', major: 'engineering-and-technology' }],
});
const wed = at('wed', 'Wed Person', '2026-09-09T09:00:00+02:00', { disciplines: [{ slug: 'law', name: 'Law', major: 'social-sciences' }] });
const midnight = at('midnight', 'Midnight Person', '2026-09-16T00:30:00+02:00');
const october = at('october', 'October Person', '2026-10-02T12:15:00+02:00');
const past = at('past', 'Past Person', '2026-07-01T11:00:00+02:00', { stream: undefined, recording: { url: 'https://youtu.be/rec', platform: 'youtube' } });
const ALL = [live, wed, midnight, october, past];

const renderCalendar = () => render(<DefenseCalendar defenses={ALL} majors={MAJORS} renderedAt={RENDERED_AT} />);
const period = () => document.querySelector('.toolbar-period')?.textContent;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: NOW });
  window.history.replaceState(null, '', '/');
});
afterEach(() => {
  vi.useRealTimers();
  process.env['TZ'] = 'Europe/Amsterdam';
});

describe('DefenseCalendar: month view on today', () => {
  it('opens in the month view with today outlined and the legend of present fields', () => {
    const { container } = renderCalendar();
    expect(period()).toBe('September 2026');
    expect(screen.getByRole('button', { name: 'Month', pressed: true })).toBeTruthy();
    expect(container.querySelector('.month-cell-today .month-num')?.textContent).toBe('7');
    const legend = within(screen.getByRole('list', { name: 'Major fields' })).getAllByRole('listitem');
    expect(legend.map((l) => l.textContent)).toEqual(['Natural sciences', 'Engineering and technology', 'Social sciences']);
  });

  it('heads the page with the headline strip and the intro', () => {
    renderCalendar();
    const items = within(screen.getByRole('list', { name: 'Headlines' })).getAllByRole('listitem');
    expect(items.map((i) => i.textContent)).toEqual([
      'On air nowLive Person defends at KTH!',
      'Coming up3 defenses you can still catch live',
      'Catch-up1 recording ready to watch',
    ]);
    expect(screen.getByRole('heading', { level: 1, name: 'PhD defenses you can watch live' })).toBeTruthy();
    expect(screen.getByText('Special issue')).toBeTruthy();
  });

  it('places chips on the viewer-local date as links to the defense pages', () => {
    renderCalendar();
    expect(screen.getByRole('link', { name: /Wed Person/ }).getAttribute('href')).toBe('/defenses/wed/');
    expect(screen.getByRole('link', { name: /Midnight Person/ }).closest('.month-cell')?.querySelector('.month-num')?.textContent).toBe('16');
    expect(screen.queryByRole('link', { name: /Past Person/ })).toBeNull();
  });

  it('surfaces the live defense above the toolbar with its stream link and the starburst', () => {
    renderCalendar();
    const strip = screen.getByRole('region', { name: 'Live now' });
    expect(within(strip).getByText('Live Person')).toBeTruthy();
    expect(within(strip).getByRole('link', { name: 'Watch the livestream' })).toBeTruthy();
    expect(strip.querySelector('.starburst')?.textContent).toBe('On air!');
  });
});

describe('DefenseCalendar: navigation and the URL', () => {
  it('switches views, keeps the anchor and writes the view to the URL', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: 'Week' }));
    expect(period()).toBe('7 – 13 Sep 2026');
    expect(screen.getByText('Now')).toBeTruthy();
    expect(window.location.search).toBe('?view=week');
    fireEvent.click(screen.getByRole('button', { name: 'Year' }));
    expect(period()).toBe('2026');
    expect(within(screen.getByRole('region', { name: 'September 2026' })).getByText('3 defenses')).toBeTruthy();
    expect(within(screen.getByRole('region', { name: 'July 2026' })).getByText('1 defense')).toBeTruthy();
  });

  it('moves with previous, next and Today, writing only a non-default date', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(period()).toBe('October 2026');
    expect(window.location.search).toBe('?date=2026-10-07');
    expect(screen.getByRole('link', { name: /October Person/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(period()).toBe('September 2026');
    expect(window.location.search).toBe('');
  });

  it('applies the filters to every view, including the year counts, but not to the headlines', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: 'Year' }));
    fireEvent.change(screen.getByLabelText('Discipline'), { target: { value: 'law' } });
    expect(within(screen.getByRole('region', { name: 'September 2026' })).getByText('1 defense')).toBeTruthy();
    expect(window.location.search).toBe('?discipline=law&view=year');
    expect(screen.getByText('3 defenses you can still catch live')).toBeTruthy();
  });

  it('offers jump links in an empty week and lands on the next defense', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: 'Week' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }));
    expect(period()).toBe('21 – 27 Sep 2026');
    expect(screen.getByRole('status').textContent).toContain('No defenses this week.');
    expect(screen.getByRole('button', { name: 'Previous: Wed 16 Sep 2026' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next: Fri 2 Oct 2026' }));
    expect(period()).toBe('28 Sep – 4 Oct 2026');
    expect(screen.getByRole('link', { name: /October Person/ })).toBeTruthy();
    expect(window.location.search).toBe('?view=week&date=2026-10-02');
  });

  it('reads the view, the date and the filters from the URL', () => {
    window.history.replaceState(null, '', '/?view=day&date=2026-07-01');
    renderCalendar();
    expect(screen.getByRole('heading', { level: 2, name: 'Wednesday 1 July 2026' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Watch the recording' })).toBeTruthy();
    expect(window.location.search).toBe('?view=day&date=2026-07-01');
  });

  it('opens a day from the year view', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: 'Year' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wed 9 Sep 2026, 1 defense' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Wednesday 9 September 2026' })).toBeTruthy();
    expect(window.location.search).toBe('?view=day&date=2026-09-09');
  });
});

describe('DefenseCalendar: build-time markup and hydration', () => {
  it('renders the build month with institution-local dates and hydrates without mismatch', () => {
    const html = renderToString(<DefenseCalendar defenses={ALL} majors={MAJORS} renderedAt={RENDERED_AT} />);
    expect(html).toContain('September 2026');
    expect(html).toContain('Special issue');
    expect(html).toContain('Midnight Person');
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<DefenseCalendar defenses={ALL} majors={MAJORS} renderedAt={RENDERED_AT} />, { container, hydrate: true });
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([]);
    errors.mockRestore();
    expect(within(container).getByRole('link', { name: /Midnight Person/ }).closest('.month-cell')?.querySelector('.month-num')?.textContent).toBe('16');
  });

  it('regroups a midnight defense onto the viewer-local date after mount', () => {
    process.env['TZ'] = 'America/New_York';
    renderCalendar();
    expect(screen.getByRole('link', { name: /Midnight Person/ }).closest('.month-cell')?.querySelector('.month-num')?.textContent).toBe('15');
    expect(screen.getByText('18:30')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `/opt/homebrew/bin/npx vitest run test/components/DefenseCalendar.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the island**

Create `src/components/DefenseCalendar.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react';
import {
  calendarFromSearch,
  DEFAULT_VIEW,
  groupByDate,
  periodBounds,
  searchFromState,
  todayIn,
  type CalendarState,
  type DateString,
} from '../lib/calendar.ts';
import { defensePhase, type Defense } from '../lib/defense.ts';
import { applyFilters, filtersFromSearch, type Filters } from '../lib/filters.ts';
import { CalendarToolbar } from './CalendarToolbar.tsx';
import { DayView } from './DayView.tsx';
import { DefenseCard } from './DefenseCard.tsx';
import { EmptyPeriod } from './EmptyPeriod.tsx';
import { FilterBar } from './FilterBar.tsx';
import { HeadlineStrip } from './HeadlineStrip.tsx';
import { MajorFieldLegend, type MajorField } from './MajorFieldLegend.tsx';
import { MonthView } from './MonthView.tsx';
import { PageIntro } from './PageIntro.tsx';
import { useViewerClock } from './useViewerClock.ts';
import { WeekView } from './WeekView.tsx';
import { YearView } from './YearView.tsx';

export interface DefenseCalendarProps {
  /** Every published defense, past and future. */
  defenses: Defense[];
  /** The major fields of the vocabulary, for the legend. */
  majors: MajorField[];
  /** Build time, so the first client render matches the server render before the real clock takes over. */
  renderedAt?: string;
}

const LEDE =
  'Public defenses streamed for free by universities, shown in your local time. Browse by day, week, month or year. Past dates show where a recording exists. Subscribe to the calendar feed to get them in your own calendar.';

function uniqueOptions(defenses: Defense[], pick: (d: Defense) => Array<{ slug: string; name: string }>) {
  const seen = new Map<string, string>();
  for (const d of defenses) for (const o of pick(d)) seen.set(o.slug, o.name);
  return [...seen].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The home page below the masthead. Before mount (the build output and the no-script fallback) it shows the
 * build month with each defense on its institution-local date; after mount the viewer's clock, zone and URL
 * take over.
 */
export function DefenseCalendar({ defenses, majors, renderedAt }: DefenseCalendarProps) {
  const clock = useViewerClock();
  const buildNow = renderedAt ? new Date(renderedAt) : new Date();
  const now = clock.now ?? buildNow;
  const zone = clock.zone;
  const today: DateString = zone ? todayIn(zone, now) : todayIn('UTC', now);

  const [filters, setFilters] = useState<Filters>({});
  const [calendar, setCalendar] = useState<CalendarState>(() => ({ view: DEFAULT_VIEW, date: todayIn('UTC', buildNow) }));

  useEffect(() => {
    const viewerZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setFilters(filtersFromSearch(window.location.search));
    setCalendar(calendarFromSearch(window.location.search, todayIn(viewerZone, new Date())));
  }, []);

  const writeUrl = (nextCalendar: CalendarState, nextFilters: Filters) => {
    window.history.replaceState(null, '', `${window.location.pathname}${searchFromState(nextCalendar, nextFilters, today)}`);
  };
  const updateFilters = (next: Filters) => {
    setFilters(next);
    writeUrl(calendar, next);
  };
  const updateCalendar = (next: CalendarState) => {
    setCalendar(next);
    writeUrl(next, filters);
  };

  const disciplines = useMemo(() => uniqueOptions(defenses, (d) => d.disciplines), [defenses]);
  const universities = useMemo(() => uniqueOptions(defenses, (d) => [d.university]), [defenses]);
  const presentMajors = useMemo(
    () => majors.filter((m) => defenses.some((d) => d.disciplines.some((x) => x.major === m.slug))),
    [majors, defenses],
  );
  const visible = useMemo(() => applyFilters(defenses, filters), [defenses, filters]);
  const groups = useMemo(() => groupByDate(visible, zone), [visible, zone]);
  const live = visible
    .filter((d) => defensePhase(d, now) === 'live')
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const bounds = periodBounds(calendar.view, calendar.date);
  const isEmpty = calendar.view !== 'year' && ![...groups.keys()].some((day) => day >= bounds.start && day <= bounds.end);

  return (
    <div className="calendar">
      <HeadlineStrip defenses={defenses} now={now} zone={zone} />
      <div className="column">
        <PageIntro kicker="Special issue" title="PhD defenses you can" highlight="watch live" lede={LEDE} />
        <FilterBar filters={filters} disciplines={disciplines} universities={universities} onChange={updateFilters} />
        <MajorFieldLegend majors={presentMajors} />
        {live.length > 0 && (
          <section className="live" aria-label="Live now">
            <h2 className="live-heading">Live now</h2>
            <span className="starburst" aria-hidden="true">
              On air!
            </span>
            {live.map((d) => (
              <DefenseCard key={d.key} defense={d} phase="live" now={now} viewerZone={zone} />
            ))}
          </section>
        )}
        <CalendarToolbar state={calendar} today={today} onChange={updateCalendar} />
        {isEmpty && <EmptyPeriod state={calendar} dates={groups.keys()} onJump={(date) => updateCalendar({ ...calendar, date })} />}
        {calendar.view === 'day' && !isEmpty && (
          <DayView date={calendar.date} defenses={groups.get(calendar.date) ?? []} now={now} zone={zone} />
        )}
        {calendar.view === 'week' && <WeekView date={calendar.date} groups={groups} today={today} now={now} zone={zone} />}
        {calendar.view === 'month' && (
          <MonthView
            date={calendar.date}
            groups={groups}
            today={today}
            now={now}
            zone={zone}
            onOpenDay={(date) => updateCalendar({ view: 'day', date })}
          />
        )}
        {calendar.view === 'year' && (
          <YearView
            date={calendar.date}
            groups={groups}
            onOpenMonth={(date) => updateCalendar({ view: 'month', date })}
            onOpenDay={(date) => updateCalendar({ view: 'day', date })}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the island test**

Run: `/opt/homebrew/bin/npx vitest run test/components/DefenseCalendar.test.tsx`
Expected: PASS.

- [ ] **Step 5: Register the island and the redirect page, and delete the schedule**

Create `src/site/client/calendar.tsx`:

```tsx
// Browser entry for the home page calendar.
import { DefenseCalendar } from '../../components/DefenseCalendar.tsx';
import { hydrateIslands } from './hydrate.tsx';

hydrateIslands('DefenseCalendar', DefenseCalendar);
```

In `src/site/assets.ts`, replace the registry:

```ts
export const ISLAND_ENTRIES = {
  DefenseCalendar: 'src/site/client/calendar.tsx',
  DefensePage: 'src/site/client/defense.tsx',
} as const;
```

In `src/site/document.tsx`, add a `refresh` prop: extend the interface with `/** Target of a meta refresh, for redirect pages. */ refresh?: string;`, destructure it, and add after the `<title>`:

```tsx
        {refresh && <meta httpEquiv="refresh" content={`0; url=${refresh}`} />}
```

Replace `src/site/pages.tsx` with:

```tsx
// One function per page type: a data-bearing header around one component tree.
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { DefenseCalendar } from '../components/DefenseCalendar.tsx';
import { DefensePage } from '../components/DefensePage.tsx';
import type { MajorField } from '../components/MajorFieldLegend.tsx';
import { Shell } from '../components/Shell.tsx';
import type { Defense } from '../lib/defense.ts';
import { withBase } from '../lib/paths.ts';
import { pageAssets, type AssetManifest } from './assets.ts';
import { Document } from './document.tsx';
import { Island } from './islands.tsx';

export interface PageContext {
  /** Site base path, e.g. /phdtv/. */
  base: string;
  manifest: AssetManifest;
  /** Build time as ISO 8601; the first client render uses it so hydration matches the server markup. */
  renderedAt: string;
}

export interface HomeData {
  defenses: Defense[];
  majors: MajorField[];
}

/** A complete HTML document. React does not emit the doctype, so it is added here. */
export function renderDocument(element: ReactElement): string {
  return `<!doctype html>\n${renderToString(element)}\n`;
}

/** The home page: the calendar island renders everything below the masthead, headline strip included. */
export function homePage({ defenses, majors }: HomeData, { base, manifest, renderedAt }: PageContext): string {
  return renderDocument(
    <Document
      title="PhD TV"
      description="A calendar of PhD defenses that are livestreamed for free."
      base={base}
      assets={pageAssets(manifest, base, ['DefenseCalendar'])}
    >
      <Shell base={base} current="calendar">
        <Island name="DefenseCalendar" component={DefenseCalendar} props={{ defenses, majors, renderedAt }} />
      </Shell>
    </Document>,
  );
}

/** The old archive URL: a meta refresh to the calendar's year view with the recordings filter on. */
export function archiveRedirectPage({ base, manifest }: PageContext): string {
  const target = `${withBase(base, '/')}?view=year&recorded=1`;
  return renderDocument(
    <Document title="PhD TV: archive" base={base} assets={pageAssets(manifest, base, [])} refresh={target}>
      <Shell base={base}>
        <div className="column">
          <p className="redirect">
            The archive is now part of the calendar. <a href={target}>Continue to past defenses with recordings.</a>
          </p>
        </div>
      </Shell>
    </Document>,
  );
}

export function defensePage(defense: Defense, { base, manifest, renderedAt }: PageContext): string {
  return renderDocument(
    <Document
      title={`${defense.candidate}: ${defense.title}`}
      description={`PhD defense at ${defense.university.name}.`}
      base={base}
      assets={pageAssets(manifest, base, ['DefensePage'])}
    >
      <Shell base={base}>
        <div className="column">
          <Island name="DefensePage" component={DefensePage} props={{ defense, base, renderedAt }} />
        </div>
      </Shell>
    </Document>,
  );
}
```

In `src/site/generate.ts`, change the import to `import { archiveRedirectPage, defensePage, homePage } from './pages.tsx';`, the loader line to `const { defenses, disciplineSlugs, majors } = loadSiteData(rootDir, base);`, and the two page lines to:

```ts
  files.push({ path: 'index.html', body: homePage({ defenses, majors }, context) });
  files.push({ path: 'archive/index.html', body: archiveRedirectPage(context) });
```

Delete the old island:

```bash
git rm src/components/DefenseSchedule.tsx src/site/client/schedule.tsx test/components/DefenseSchedule.test.tsx
```

- [ ] **Step 6: Update the site tests**

In `test/site/pages.test.tsx`: in `manifest`, replace the `schedule.tsx` key with `'src/site/client/calendar.tsx': { file: 'assets/calendar-123.js', imports: ['_react-xyz.js'] },`; change the import to `import { archiveRedirectPage, defensePage, homePage, renderDocument } from '../../src/site/pages.tsx';`; replace the two list-page tests with:

```tsx
  it('home page: calendar island with the majors, its script, and the static month as fallback', () => {
    const html = homePage({ defenses: [defense], majors: [{ slug: 'natural-sciences', name: 'Natural sciences' }] }, ctx);
    expect(html).toContain('<title>PhD TV</title>');
    expect(html).toContain('Special issue');
    expect(html).toContain('PhD defenses you can');
    expect(html).toContain('watch live');
    expect(html).toContain('you can still catch live');
    expect(html).toContain('data-island="DefenseCalendar"');
    expect(html).toContain('"majors":[{"slug":"natural-sciences"');
    expect(html).toContain('"renderedAt":"2026-09-05T12:00:00.000Z"');
    expect(html).toContain('src="/phdtv/assets/calendar-123.js"');
    expect(html).toContain('href="/phdtv/assets/global-abc.css"');
    expect(html).toContain('September 2026');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('aria-current="page"');
  });

  it('archive page: a redirect to the year view with the recordings filter', () => {
    const html = archiveRedirectPage(ctx);
    expect(html).toContain('<title>PhD TV: archive</title>');
    expect(html).toContain('<meta http-equiv="refresh" content="0; url=/phdtv/?view=year&amp;recorded=1"/>');
    expect(html).toContain('Continue to past defenses with recordings.');
    expect(html).not.toContain('data-island');
  });
```

In `test/build/site.test.ts`: replace the `schedule.tsx` manifest key with `'src/site/client/calendar.tsx': { file: 'assets/calendar-test.js' },`; replace the `generates the two list pages…` test body's first two lines with

```ts
    expect(read('index.html')).toContain('data-island="DefenseCalendar"');
    expect(read('archive/index.html')).toContain('http-equiv="refresh"');
```

extend the `Export` interface's defense element with `disciplines: Array<{ slug: string; major: string }>; university: { name: string; shortName?: string };` (replace the existing `university` entry) and add to the `resolves institution names…` test:

```ts
    expect(one?.university.shortName).toBe('UU');
    expect(one?.disciplines.map((d) => d.major)).toContain('social-sciences');
```

In `test/site/islands.test.tsx`, replace every `"DefenseSchedule"` with `"DefenseCalendar"` (four places).

In `test/site/assets.test.ts`, replace the `schedule.tsx` key with `'src/site/client/calendar.tsx': { file: 'assets/calendar-123.js', imports: ['_react-xyz.js'] },`, and in the two expectations replace `'DefenseSchedule'` with `'DefenseCalendar'` and `schedule-123.js` with `calendar-123.js`.

- [ ] **Step 7: Run everything**

Run: `/opt/homebrew/bin/npm run typecheck && /opt/homebrew/bin/npm test`
Expected: PASS, including `test/build/bundle.test.ts` (it checks `archive/index.html` exists, which the redirect satisfies). `grep -rn DefenseSchedule src test` prints nothing.

- [ ] **Step 8: Commit**

```bash
git add -A src test
git commit -m "$(cat <<'EOF'
Replace the schedule list with the calendar island and redirect the archive

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3dwE9qGamJauAbeBCZ3U2
EOF
)"
```

---

### Task 9: Defense page badge, README, visual check and devlog

**Files:**
- Modify: `src/components/DefensePage.tsx:35-40`
- Modify: `README.md` ("Using the site")
- Test: `test/components/DefensePage.test.tsx`
- Create: `blog/2026-09-NN-calendar-views-landed.md` (NN per the devlog convention), `blog/media/2026-09-NN-calendar-views-landed/*.png`
- Modify: `.devlog/learned.md`, `blog/index.md`

- [ ] **Step 1: Write the failing test**

In `test/components/DefensePage.test.tsx`, add inside the first test after the `Jane Doe` line:

```tsx
    expect(screen.getByText('TU Delft')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'University announcement' }).getAttribute('href')).toBe('https://www.tudelft.nl/en/events/2026/phd-defence-jane-doe');
```

and inside the `says how a listing arrived when there is no source url` test, after its existing assertion:

```tsx
    expect(screen.queryByRole('link', { name: 'University announcement' })).toBeNull();
```

and add a test:

```tsx
  it('marks a defense in progress', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-09-15T10:45:00Z') });
    render(<DefensePage defense={fixtureDefense()} renderedAt="2026-09-15T10:45:00.000Z" />);
    expect(screen.getByText('Live now').className).toBe('pill-live');
    vi.useRealTimers();
  });
```

with `vi` added to the vitest import.

- [ ] **Step 2: Run the test to verify it fails**

Run: `/opt/homebrew/bin/npx vitest run test/components/DefensePage.test.tsx`
Expected: FAIL — no "TU Delft" text; no link named "University announcement"; the live badge has class `badge-live`.

- [ ] **Step 3: Add the badge and the announcement link**

In `src/components/DefensePage.tsx`, add `institutionLabel` to the import from `../lib/defense.ts` (`import { institutionLabel, type Defense } from '../lib/defense.ts';`), then add a link to the page where the university announced the defense at the end of the `<p className="defense-actions">` block, after the thesis link:

```tsx
        {defense.source.url && (
          <a className="action action-secondary" href={defense.source.url}>
            University announcement
          </a>
        )}
```

and replace the `<header className="defense-head">` block with:

```tsx
      <header className="defense-head">
        <p className="defense-kicker">
          <span className="badge-inst">{institutionLabel(defense)}</span>
          {phase === 'live' && <span className="pill-live">Live now</span>}
        </p>
        <p className="defense-candidate">{defense.candidate}</p>
        <h1 className="defense-title">{defense.title}</h1>
      </header>
```

- [ ] **Step 4: Run the test**

Run: `/opt/homebrew/bin/npx vitest run test/components/DefensePage.test.tsx && /opt/homebrew/bin/npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Update the README**

Replace the "Using the site" section of `README.md` with:

```markdown
## Using the site

- The front page is a calendar of every listed defense, past and future, in your local time, with day, week, month and year views. Defenses in progress are surfaced above it with their stream link.
- Filters by discipline, institution and "only defenses with a recording" apply to every view; chips are coloured by the discipline's OECD major field.
- Past dates say plainly whether a recording is available, pending, known not to exist, or simply not known. "Recordings" in the header opens the year view with the recordings filter on.
- The view, the date and the filters are in the URL, so a link reopens the same screen.
- `https://phdtv.net/feeds/all.ics` is a calendar feed of every upcoming defense; `feeds/<discipline>.ics` narrows it to one field. Events update in place when a stream link is added.
- `https://phdtv.net/api/defenses.json` is the whole published dataset with a schema version.
```

- [ ] **Step 6: Visual check with the dev server and headless Chrome**

Start the dev server in the background and capture the four views plus a phone width:

```bash
/opt/homebrew/bin/npm run dev &
sleep 8
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p /tmp/phdtv-shots
for v in month week year day; do
  "$CH" --headless=new --disable-gpu --hide-scrollbars --user-data-dir=/tmp/phdtv-chrome --virtual-time-budget=8000 --window-size=1440,1600 --screenshot=/tmp/phdtv-shots/$v.png "http://localhost:4321/?view=$v&date=2026-09-15" >/dev/null 2>&1
done
cat > /tmp/phdtv-shots/phone.html <<'EOF'
<!DOCTYPE html><html><body style="margin:0"><iframe src="http://localhost:4321/?date=2026-09-15" width="390" height="1500" style="border:0"></iframe></body></html>
EOF
"$CH" --headless=new --disable-gpu --hide-scrollbars --user-data-dir=/tmp/phdtv-chrome --virtual-time-budget=8000 --window-size=400,1500 --screenshot=/tmp/phdtv-shots/phone.png "file:///tmp/phdtv-shots/phone.html" >/dev/null 2>&1
kill %1
```

Open each image (the Read tool shows images) and check against the third-round renders in `blog/media/2026-09-06-01-calendar-views-designed/` (`month-v3.png`, `week-v3.png`, `year-v3.png`, `day-v3.png`): a black masthead band with the red "PHD TV" box and its yellow offset shadow, the Calendar link as a yellow box, the three-colour headline strip continuing the band, the slanted yellow "Special issue" kicker over the Archivo Black title with "watch live" in red, a 2px-bordered filter card, the red live strip with the yellow "On air!" starburst on its top right, the yellow toolbar with white buttons and the active view in red, black weekday bars with yellow text, cream cells with hairline borders, today outlined in blue on a pale yellow tint, colour-striped chips, six-row mini-months with aligned captions, the day view under a double rule with a black-and-yellow date bar, and the phone month as dots. Note: headless Chrome will not open a window narrower than about 500px, which is why the phone capture goes through an iframe. Fix any CSS that is off, rerun the captures, and copy the final images into `blog/media/2026-09-NN-calendar-views-landed/` as `month.png`, `week.png`, `year.png`, `day.png`, `phone.png`.

- [ ] **Step 7: Run the whole suite and the build**

Run: `/opt/homebrew/bin/npm run typecheck && /opt/homebrew/bin/npm test && /opt/homebrew/bin/npm run validate && /opt/homebrew/bin/npm run schema:check`
Expected: all PASS.

- [ ] **Step 8: Write the devlog entry and update the notebook**

Following the convention in the user's global `CLAUDE.md`: read `.devlog/learned.md`; create `blog/2026-09-NN-calendar-views-landed.md` with the standard frontmatter (`type: "Devlog Entry"`, `tags: [feature, ux, architecture]`), a "What changed" section naming the files and the four views, "Why it matters" (one page for past and future, density visible at four scales, filters applied before counting), "How it works" (the `YYYY-MM-DD` helpers, the institution-local grouping before mount and viewer-local after, the URL state, the archive redirect, self-hosted fonts), the five screenshots embedded as `![…](media/2026-09-NN-calendar-views-landed/month.png)` and so on, "What's next" (the deferred items from the spec's out-of-scope list), and a "Surprises" section written from what actually happened during execution. Add a `> **Update YYYY-MM-DD**` blockquote under "What's next" of `blog/2026-09-06-01-calendar-views-designed.md` linking to the new entry. In `.devlog/learned.md`: replace the `src/components/DefenseSchedule.tsx` entity line with one for `DefenseCalendar.tsx` and `src/lib/calendar.ts`, add a recurring theme "dates in the calendar are YYYY-MM-DD strings; the only zone-aware step is localDateString", and delete the calendar open thread. Run `devlog index`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Badge the defense page, update the README and record the calendar landing

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3dwE9qGamJauAbeBCZ3U2
EOF
)"
```

---

## Self-review notes

- **Spec coverage.** Structure and URL state: Tasks 2 and 8. Files list: Tasks 1, 3, 4, 5, 6, 7, 8, 9 (every file in the spec's list appears in a task; `EmptyPeriod.tsx` is an addition the spec allowed under "subject to refinement"). Toolbar, day, week, month, year, chips, empty periods, narrow screens: Tasks 3 (CSS), 5, 6, 7. Time zones and hydration: Task 2 (`groupByDate` with a null zone) and Task 8 (build-time UTC today, effect-based hand-over, hydration test). Filters, legend, colours, live strip: Tasks 3, 4, 8. Look: Task 3 (type, tokens, header, every component's rules), Task 9 (defense page badge). Testing list: every named test file exists in Tasks 1 to 9. Migration and copy: Task 1 (short names), Task 8 (lede, redirect), Task 9 (README, devlog, notebook).
- **Type consistency.** `groups` is always `Map<DateString, Defense[]>`; `zone` is `string | null` everywhere; `onOpenDay`/`onOpenMonth` take a `DateString`; `CalendarState` is `{ view, date }` in the toolbar, the empty period and the island; `MajorField` is defined once in `MajorFieldLegend.tsx` and imported by `pages.tsx` and `DefenseCalendar.tsx`.
- **Known judgement calls.** The toolbar's period label is a `span`, not a heading, so the day view's `h2` stays the only second-level heading in the calendar. The year view's `region` roles come from `section` elements with `aria-label`, which is what the tests query.
