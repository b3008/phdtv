## Purpose

The past-defense views of the site, which surface recordings where they exist and say plainly when they do not.

## ADDED Requirements

### Requirement: Archive listing
The site SHALL provide an archive view listing every published defense whose `starts_at` is in the past, ordered by start time descending, with the same discipline and institution filters as the upcoming view.

#### Scenario: Viewer opens the archive
- **WHEN** a viewer opens the archive view
- **THEN** they see only published past defenses, most recent first

### Requirement: Recording availability states
Each past defense SHALL display exactly one recording state:
- **available** when `recording.url` is set, shown as a link with its platform;
- **not recorded** when `recording.status` is `none`;
- **not yet available** when neither is set and the defense ended less than 30 days ago;
- **no recording known** when neither is set and the defense ended 30 days ago or more.

#### Scenario: Recording exists
- **WHEN** a past defense has `recording.url`
- **THEN** the archive shows a link to the recording labelled with its platform

#### Scenario: Known not recorded
- **WHEN** a past defense has `recording.status: none`
- **THEN** the archive shows that the defense was not recorded

#### Scenario: Recent defense without recording
- **WHEN** a past defense ended less than 30 days ago and has no recording information
- **THEN** the archive shows that the recording is not yet available

#### Scenario: Old defense without recording
- **WHEN** a past defense ended 30 days ago or more and has no recording information
- **THEN** the archive shows that no recording is known

### Requirement: Recordings-only view
The archive SHALL offer a filter that shows only defenses with an available recording.

#### Scenario: Viewer wants something to watch
- **WHEN** a viewer enables the recordings-only filter
- **THEN** only past defenses with `recording.url` are listed
