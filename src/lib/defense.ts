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
