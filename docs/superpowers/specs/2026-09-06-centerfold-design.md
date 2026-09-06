# Centerfold feature pages

Date: 2026-09-06
Status: approved in conversation on 2026-09-06. The handoff below came from the user's Claude Design project and is the binding description of the page; the table records the decisions taken around it.

## Decisions taken before implementation

| Question | Decision |
|---|---|
| Base branch | `centerfold`, branched from `calendar-views` at 8eb627e, so the page reuses the view model's short institution name, major field and phase helpers. |
| The Design10 look | Not in the codebase when this branch started; the calendar plan's Task 3 encoded the earlier prototype round. Agreed by message with the calendar-views session on 2026-09-06: that branch owns the shared styling layer (fonts, tokens, `global.css`, `Shell.tsx`, `PageIntro.tsx`, the headline strip) and builds it on Design10; this branch owns only the centerfold files and rebases onto calendar-views once Task 3 lands. |
| Fonts | Self-hosted from `@fontsource/oswald`, `@fontsource/archivo-black` and `@fontsource/archivo`, added by calendar-views. The centerfold uses the shared `--display`, `--condensed` and `--sans` stacks. No request to Google Fonts. |
| Stylesheet | `src/styles/centerfold.css`, imported from the centerfold client entry so Vite emits it as that island's CSS chunk and page assembly adds it. It uses the shared token names only. The `Centerfold ›` tag class lives in the shared stylesheet because the defense page and the cards do not load the centerfold stylesheet. |
| Dark mode | Follows the system preference with the handoff's dark palette. No toggle button, as the calendar spec decided. |
| URL | `/centerfold/<defense id>/`, mirroring `/defenses/<defense id>/`, where the id is `<year>/<local date>-<university>-<candidate>`. |
| Preview builds | A `preview` build option, on for the dev server and for `SITE_PREVIEW=1`, renders labelled placeholder slots for empty editorial fields; the deploy build hides those blocks. |
| Images | Site-relative paths such as `/img/centerfold/<slug>/portrait.jpg`, served from a `public/` directory that Vite copies into the build, or absolute http(s) URLs. |
| Blurb strip | Owned by calendar-views as the headline strip. Whether the centerfold page can render it statically at build time is a request to that session; until then the page sits under the masthead alone. |
| Back link | Reads the referrer's `view` parameter when the referrer is the calendar page, then a `from` query parameter, then falls back to the month view. The first client render matches the server render. |
| Discipline rows | The meta line and the Close-up "Discipline" row show the major field's name, as in the prototype. |
| Design references | The calendar prototype with the centerfold route and the design system are `prototype-v3.dc.html` and `style-reference.dc.html` under `blog/media/2026-09-06-01-calendar-views-designed/`, copied by the calendar session; the frozen calendar styling the page sits inside is `blog/media/2026-09-06-02-centerfold-pages/design10.dc.html`. They are Claude Design `.dc.html` templates, not runnable HTML. |

## The handoff, as received

## Task

Add a "Centerfold" feature page type to the PhD TV site (phdtv.net, static site listing livestreamed PhD defenses). A centerfold is a magazine-style feature page dedicated to one defense: candidate, thesis title as a giant pull quote, photos, a short Q&A, a facts box, and a "Tune in" bar linking to the stream or recording. Only some defenses get one; the calendar and defense pages link to it where it exists.

## About the design files

`PhD TV Calendar.dc.html` and `Design10.dc.html` are **HTML design prototypes**, not production code. Recreate the centerfold page and its entry points in the site's own stack and conventions (its static-site generator, templates, CSS approach). Do not copy the prototype's runtime or its inline-style structure. Where the site already has tokens or components for the same thing (the institution badge, the reversed weekday bar, the yellow toolbar), reuse them.

The prototype's centerfold is reached by: month view → any card with a yellow "Centerfold ›" tag (Anders Enqvist in the Live now strip, or day view of 7 Sep or 1 May) → the tag, or the defense page → "Centerfold ›" tag next to the institution badge.

## Fidelity

**High-fidelity.** Colors, type, spacing and rules are final. Match them.

## Data model

Add an optional `centerfold` object to a defense record. All fields are editorial and may be empty; render a slot placeholder for empty ones on preview builds, hide the block in production.

```yaml
centerfold:
  issue: "No. 37"                 # small label in the top bar
  kicker: "This week's centerfold" # rotated yellow tag above the name
  standfirst: "One or two sentences of plain-language framing."
  portrait: /img/…                 # 3:4-ish, fills the left half of the hero
  wide: /img/…                     # 16:9, lab / campus / work in progress
  detail: /img/…                   # optional, a figure from the thesis
  quote: "Pull quote from the candidate."
  questions:
    - q: "Why this topic?"
      a: "…"
    - q: "What surprised you?"
      a: "…"
    - q: "What happens after the defense?"
      a: "…"
  facts:                           # extra rows for the Close-up box
    - [Faculty, "Electrical Engineering and Computer Science"]
    - [Format, "Public defense, livestreamed"]
    - [Language, English]
```

Fields derived from the defense itself, not repeated: candidate name, thesis title, institution (short + full), major field, date/time in viewer time and institution time, status (upcoming / live / past), stream URL, recording URL.

URL: `/centerfold/<defense-slug>/`. Back link returns to the referring calendar view (read `document.referrer` or a `?from=` param; fall back to the month view).

## Page layout

One centered column, max-width 64rem, 20px side padding, on the site's standard header (masthead + blurb strip) and page background `#fbf7ea`.

Top to bottom, inside one box with a `2px solid #141210` border and `#ffffff` background:

1. **Top bar** — full width, `#141210` background, `#ffd400` text, Oswald 600 11px uppercase, letter-spacing .16em, padding 6px 14px. Left: `Centerfold · {issue}`. Right: institution badge (1px `#ffd400` border, same type, padding 0 5px) and, when live, a `Live now` tag (`#d90429` background, white text, padding 1px 6px).

2. **Hero** — two columns, `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, bottom border `2px solid #141210`.
   - Left: portrait image, `object-fit: cover`, min-height 380px, right border `1px solid #cdc4b0`.
   - Right: padding 22px 24px 24px, vertically centered. Kicker tag: `#ffd400` background, `#141210` text, Oswald 600 11px uppercase, letter-spacing .2em, padding 3px 8px, `transform: rotate(-1.5deg)`. Candidate name: Archivo Black 46px, line-height .95, letter-spacing −.025em, uppercase, margin-top 12px. Meta line: `{institution full} · {field}`, Oswald 600 12px uppercase, letter-spacing .12em, `#615a4f`, margin-top 8px. Standfirst: Archivo 400 15px / 1.55, margin-top 16px.

3. **Thesis banner** — full width, `#d90429` background, white text, padding 26px 24px 28px, bottom border `2px solid #141210`. Label `The thesis` in Oswald 600 11px uppercase .2em at 90% opacity; the thesis title in curly quotes, Archivo Black 34px, line-height 1, letter-spacing −.02em, uppercase, max-width 52rem, margin-top 6px.

4. **Body** — two columns, same auto-fit grid.
   - Left (padding 20px 24px 24px, right border `1px solid #cdc4b0`):
     - Heading `Three questions`: Oswald 700 18px uppercase, letter-spacing .06em, `border-bottom: 2px solid #141210`, padding-bottom 4px.
     - Each Q&A row: grid `40px 1fr`, gap 12px, padding 14px 0, `border-bottom: 1px solid #cdc4b0`. Number: 34×34 square, `#141210` background, `#ffd400` Archivo Black 18px, centered. Question: Archivo Black 16px / 1.15. Answer: Archivo 400 14px / 1.55, margin-top 6px.
     - Pull-quote box, margin-top 18px: `#ffd400` background, `#141210` text, padding 18px 20px. Label `In their words` Oswald 600 10px uppercase .2em; quote Archivo Black 22px / 1.05 uppercase, letter-spacing −.01em, margin-top 4px; attribution `{name}, {institution short}` in Archivo italic 12px, margin-top 8px.
   - Right (padding 20px 24px 24px, flex column, gap 18px):
     - Wide image, height 190px, `object-fit: cover`.
     - **Close-up** box: `2px solid #141210` border. Header bar `#141210` / `#ffd400`, Oswald 600 11px uppercase .16em, padding 4px 10px. Rows: grid `96px 1fr`, gap 10px, padding 7px 10px, `border-top: 1px solid #cdc4b0`, 13px. Key in Oswald 600 11px uppercase .1em `#615a4f`; value in Archivo 400. Row order: Institution, Discipline, then the editorial `facts`, then `When` = `{Weekday D Month YYYY}, {HH:MM} CEST ({HH:MM} {ZONE} local)` when zones differ.
     - Detail image, height 120px, optional.

5. **Tune in bar** — flex, space-between, wrap, padding 14px 24px. Background `#d90429` with white text when live, otherwise `#141210` with `#fbf7ea` text. Left: label `Tune in` (Oswald 600 10px uppercase .2em, 85% opacity) over `{Ddd D Mmm YYYY} · {HH:MM} CEST` in Archivo Black 20px uppercase. Right: primary button `#ffd400` background, `#141210` text, Oswald 700 14px uppercase .08em, padding 8px 14px, text `Watch the livestream` (upcoming/live with a stream URL) or `Watch the recording on YouTube` (past with recording); if neither, plain text `Stream link not yet announced` / `No recording known` at 85% opacity. Then a text link `Listing ›` (Oswald 600 12px uppercase .1em, inherits color) to the defense page.

Above the box: back link `‹ Back to {view} view` in Oswald 600 13px uppercase .1em, site link blue `#1d4ed8`, padding-top 28px.

## Entry points

- **Defense page**: next to the institution badge and the field label, a tag `Centerfold ›` — `#ffd400` background, `#141210` text, Oswald 700 11px uppercase .1em, padding 1px 6px, no underline. Only when the defense has a centerfold.
- **Day-view cards and Live-now cards**: same tag, in the badge row after the `Live` pill.
- Week/month chips do not show the tag (too dense).

## Dark palette

Page `#15130f`, card `#201d17`, ink `#f5eed9`, muted `#b0a58f`, hairline `#3d3729`, red `#ff4d5a`, yellow `#ffd83d`, bar background `#ffd83d` with `#15130f` text (reversed bars invert in dark mode). Red and yellow fills keep white / `#15130f` text respectively.

## Rules that must hold

- Hard corners everywhere; `border-radius: 0` on every box, button, badge and image.
- Flat fills only. No gradients, no blur shadows, no opacity fades on content (the 85–90% opacity on small labels over solid ink is the only exception).
- Text on a spot color is always pure white or `#141210`.
- One rotated element per screen (the kicker). No starburst on this page; the starburst belongs to the Live now strip on the calendar.
- Type never below 11px. Body 13–15px, ragged right.
- Three rule weights only: `1px #cdc4b0` inside boxes, `2px #141210` around regions, `6px double #141210` for major section breaks.

## Fonts

Archivo Black 400; Oswald 600, 700; Archivo 400, 600, italic 400. Self-host or load from Google Fonts as the site already does.

## Responsive

Below 640px the two-column grids collapse to one column (the auto-fit grid does this on its own). Hero portrait keeps min-height 380px; the tune-in bar wraps its two groups.
