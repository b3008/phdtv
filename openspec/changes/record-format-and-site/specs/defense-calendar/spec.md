## Purpose

The upcoming and live views of the site, which let a viewer find a defense to watch and see when it starts in their own local time.

## ADDED Requirements

### Requirement: Upcoming listing
The site SHALL provide an upcoming view listing every published defense whose `starts_at` is in the future, ordered by start time ascending and grouped by calendar day in the viewer's local time zone. When no defense is upcoming, the view SHALL state so explicitly.

#### Scenario: Viewer opens the upcoming view
- **WHEN** a viewer opens the upcoming view
- **THEN** they see only published future defenses, soonest first, grouped by day

#### Scenario: Nothing upcoming
- **WHEN** no published defense starts in the future
- **THEN** the view shows an explicit empty state rather than a blank page

#### Scenario: Defense passes after the site was built
- **WHEN** the site was built before a defense's start time and the viewer opens the upcoming view after that time
- **THEN** the defense is not shown as upcoming

### Requirement: Viewer-local time with institution time alongside
Every displayed start time SHALL be rendered in the viewer's local time zone, with the institution's local time and time zone name shown alongside. When local-time rendering is unavailable, the institution's local time with its time zone name SHALL be shown instead.

#### Scenario: Viewer in another time zone
- **WHEN** a viewer in New York sees a defense at 12:30 in Amsterdam
- **THEN** the listing shows 06:30 in the viewer's time and 12:30 Europe/Amsterdam alongside

#### Scenario: Scripting unavailable
- **WHEN** the viewer's browser cannot run the page's scripts
- **THEN** the listing shows the institution local time and time zone name

### Requirement: Live now
A published defense SHALL be marked live from its `starts_at` until `starts_at` plus `duration_minutes`, or plus 90 minutes when no duration is set. Live defenses SHALL be surfaced above the upcoming listing with their stream link. Live status SHALL be determined from the viewer's current time, not from when the site was built.

#### Scenario: Defense in progress
- **WHEN** a viewer opens the site during a published defense's window
- **THEN** that defense appears in a live section above the upcoming listing with a link to its stream

#### Scenario: Live defense without a stream link
- **WHEN** a defense is live and has no `stream.url`
- **THEN** it is still shown as live with a notice that no stream link is known

### Requirement: Stream link states
An upcoming defense SHALL show its stream link when `stream.url` is set, and SHALL otherwise state that the stream link has not been announced yet.

#### Scenario: Upcoming without stream link
- **WHEN** an upcoming defense has no `stream.url`
- **THEN** the listing shows a "stream link not yet announced" notice in place of a link

### Requirement: Defense detail page
Every published defense SHALL have its own page at a stable URL derived from its record path, showing candidate, title, institution, faculty, disciplines, language, start time, stream and recording links when present, thesis link when present, the abstract body when present, and an attribution of where the listing came from.

#### Scenario: Viewer opens a defense page
- **WHEN** a viewer opens a published defense's page
- **THEN** every present field is shown and the source attribution names the institution's agenda when `source.url` is set

### Requirement: Filtering
The upcoming view SHALL allow filtering by discipline and by institution, and the filter SHALL be reflected in the URL so it can be shared.

#### Scenario: Filter by discipline
- **WHEN** a viewer filters the upcoming view by a discipline
- **THEN** only defenses listing that discipline are shown and the URL encodes the filter
