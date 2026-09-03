## Purpose

Defines the single file format that every sourcing channel emits and edits for one PhD defense, including its lifecycle, provenance, ownership and validation rules.

## ADDED Requirements

### Requirement: One file per defense with a deterministic path
Each defense SHALL be stored as exactly one Markdown file at `records/<YYYY>/<YYYY-MM-DD>-<university-slug>-<candidate-slug>.md`, where the date is the local calendar date of `starts_at` in the record's `timezone`, `<university-slug>` matches the `university` field, and `<candidate-slug>` is the lower-case ASCII slug of the `candidate` field. The path is the record's identity and its deduplication key.

#### Scenario: Two channels report the same defense
- **WHEN** two independent writers produce a record for the same candidate, institution and date
- **THEN** both resolve to the same file path, so the second appears as a modification of the first rather than a new record

#### Scenario: Path disagrees with frontmatter
- **WHEN** a record's path does not match the date, university slug or candidate slug derived from its frontmatter
- **THEN** validation fails and names the expected path

### Requirement: Required fields
A record SHALL contain the frontmatter fields `candidate`, `title`, `university`, `starts_at`, `timezone`, `status` and `source.channel`. `starts_at` SHALL be an ISO 8601 date-time with a UTC offset. `timezone` SHALL be an IANA time zone name. `university` SHALL be a slug present in the university registry.

#### Scenario: Missing required field
- **WHEN** a record omits any required field
- **THEN** validation fails and names each missing field

#### Scenario: Offset inconsistent with time zone
- **WHEN** the UTC offset in `starts_at` is not the offset of `timezone` at that instant
- **THEN** validation fails and states the expected offset

### Requirement: Optional fields and strictness
A record MAY contain `faculty`, `disciplines`, `language`, `duration_minutes`, `stream`, `recording`, `thesis_url`, `verified_by` and a Markdown body. `disciplines` SHALL be a list of slugs from the project's controlled discipline vocabulary. `language` SHALL be a BCP 47 language tag. `stream` and `recording` SHALL be objects with a `url` and a `platform`. `recording` MAY instead carry `status: none` to state that no recording exists. Any field not defined by the schema SHALL cause validation to fail.

#### Scenario: Unknown field
- **WHEN** a record contains a frontmatter field the schema does not define
- **THEN** validation fails and names the unknown field

#### Scenario: Unknown discipline
- **WHEN** a record lists a discipline slug that is not in the controlled vocabulary
- **THEN** validation fails and names the slug

### Requirement: Status lifecycle
`status` SHALL be one of `unverified`, `published` or `hidden`. Only `published` records SHALL appear in any site output or feed. A record SHALL NOT be `published` unless `verified_by` is set. `hidden` records SHALL be retained in the repository but never appear in any output.

#### Scenario: Unverified record is invisible
- **WHEN** a record has `status: unverified`
- **THEN** it appears in no page, feed or export

#### Scenario: Publishing without verification
- **WHEN** a record has `status: published` and no `verified_by`
- **THEN** validation fails

#### Scenario: Takedown
- **WHEN** a curator sets a previously published record to `status: hidden`
- **THEN** the next build removes it from every page, feed and export while the file and its history remain in the repository

### Requirement: Provenance
Every record SHALL carry a `source` object with `channel` set to one of `scraped`, `submitted` or `curated`. When `channel` is `scraped`, `source.url` SHALL be present and `source.last_seen` SHALL be an ISO 8601 date-time. When `channel` is `submitted`, `source.submitted_at` SHALL be present.

#### Scenario: Scraped record without a source URL
- **WHEN** a record has `source.channel: scraped` and no `source.url`
- **THEN** validation fails

### Requirement: Curator ownership of verified records
Once a record has `verified_by` set, an automated writer SHALL NOT change any field other than the `source` object and fields that are currently empty. Proposed changes to other fields from automation SHALL be surfaced for human review rather than applied.

#### Scenario: Automation touches a verified field
- **WHEN** a change authored by an automated writer modifies a non-empty field of a record that already has `verified_by`, other than the `source` object
- **THEN** validation fails and lists the protected fields that were changed

#### Scenario: Automation fills an empty field
- **WHEN** a change authored by an automated writer sets a previously empty field such as `stream.url` on a verified record
- **THEN** validation passes

### Requirement: Validation on every proposed change
Every proposed change to `records/` or `universities/` SHALL be validated before it can be merged. Schema, path, integrity, ownership and status rules SHALL block merge on failure. Link liveness checks SHALL report unreachable URLs as warnings that do not block merge.

#### Scenario: Invalid record in a pull request
- **WHEN** a pull request adds or modifies a record that violates any blocking rule
- **THEN** the validation check fails and the failure message identifies the file and the rule

#### Scenario: Dead link in a pull request
- **WHEN** a pull request contains a record whose `stream.url` or `recording.url` does not respond
- **THEN** the validation check passes and reports the URL as a warning
