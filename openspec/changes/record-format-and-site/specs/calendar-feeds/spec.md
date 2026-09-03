## Purpose

Lets people subscribe to upcoming defenses from their own calendar application and lets programs consume the published dataset.

## ADDED Requirements

### Requirement: All-defenses calendar feed
The site SHALL publish a valid iCalendar feed at a stable URL containing one event per published defense that starts in the future or ended within the last 30 days. Each event SHALL carry a `UID` equal to the record's path-derived key, a start time in UTC, a duration, a summary of the form `<candidate>: <title>`, a description containing the stream link when known, the institution as location, and a `URL` pointing at the defense's page.

#### Scenario: Subscribing in a calendar application
- **WHEN** a viewer subscribes to the feed URL in a calendar application
- **THEN** each upcoming defense appears at the correct local time with its title and a link to the stream

#### Scenario: Hidden and unverified records
- **WHEN** a record is `hidden` or `unverified`
- **THEN** it is absent from every feed

### Requirement: Updates replace rather than duplicate
When a record changes, its event SHALL keep the same `UID` and carry a `SEQUENCE` higher than any previously published value for that event, so subscribing applications update the existing entry.

#### Scenario: Stream link added after subscription
- **WHEN** a defense already in a subscriber's calendar gains a `stream.url`
- **THEN** the next published feed carries the same `UID` with a higher `SEQUENCE` and the updated description

### Requirement: Per-discipline feeds
The site SHALL publish one feed per discipline slug at a stable URL pattern, each containing only defenses that list that discipline, with the same event rules as the all-defenses feed.

#### Scenario: Subscribing to one field
- **WHEN** a viewer subscribes to the feed for a discipline
- **THEN** only defenses listing that discipline appear

### Requirement: JSON export
The site SHALL publish a JSON document at a stable URL containing every published record with all frontmatter fields, the resolved institution name, the defense page URL and a schema version identifier.

#### Scenario: Program reads the dataset
- **WHEN** a program fetches the export
- **THEN** it receives every published record and no hidden or unverified record, with a schema version it can check
