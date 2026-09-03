## Purpose

Keeps institution metadata in one place so that records reference institutions by slug and validation can check that references are real and consistent.

## ADDED Requirements

### Requirement: One registry file per institution
Each institution SHALL be described by exactly one YAML file at `universities/<slug>.yaml` containing `slug`, `name`, `country` and `timezone`, and optionally `website`, `agenda_url` and `aliases`. `slug` SHALL equal the filename. `country` SHALL be an ISO 3166-1 alpha-2 code. `timezone` SHALL be an IANA time zone name.

#### Scenario: Registry entry missing a required field
- **WHEN** a registry file omits `name`, `country` or `timezone`
- **THEN** validation fails and names the missing field

#### Scenario: Slug does not match filename
- **WHEN** a registry file's `slug` differs from its filename
- **THEN** validation fails

### Requirement: Records reference registered institutions
The `university` field of every record SHALL match the slug of an existing registry file.

#### Scenario: Unknown institution slug
- **WHEN** a record references a slug with no registry file
- **THEN** validation fails and names the slug and the record

### Requirement: Time zone consistency
When a record's `timezone` differs from its institution's registry `timezone`, validation SHALL emit a warning identifying both values. The difference SHALL NOT block merge, since an institution may host a defense in another zone.

#### Scenario: Record in a different zone than its institution
- **WHEN** a record's `timezone` is not the registry `timezone` of its institution
- **THEN** validation passes and reports the two values as a warning

### Requirement: Institution details are shown with each defense
Every rendered defense SHALL display its institution's `name` and `country` from the registry, and SHALL link to the institution's `website` when one is registered.

#### Scenario: Defense page shows institution
- **WHEN** a viewer opens a defense whose institution has a registered website
- **THEN** the page shows the institution name and country and links to the website
