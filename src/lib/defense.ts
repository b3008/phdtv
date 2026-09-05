import type { DefenseRecord, Platform, RecordStatus } from '../schema/record.ts';
import type { University } from '../schema/university.ts';
import { withBase } from './paths.ts';
import { DEFAULT_DURATION_MINUTES, defenseWindow } from './time.ts';

export interface DefenseInput {
  /** Collection entry id, e.g. 2026/2026-09-15-tudelft-jane-doe. */
  id: string;
  body: string;
  record: DefenseRecord;
  university: University;
  disciplineNames: Record<string, string>;
  /** Site base path, e.g. /phdtv/. */
  base: string;
}

export interface DefenseLink {
  url: string;
  platform: Platform;
}

export type DefenseRecording = (DefenseLink & { availableFrom?: string }) | { status: 'none' };

/** Serialisable view of one defense, as handed to React components. */
export interface Defense {
  key: string;
  url: string;
  candidate: string;
  title: string;
  university: { slug: string; name: string; country: string; website?: string };
  faculty?: string;
  disciplines: Array<{ slug: string; name: string }>;
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

export function toDefense({ id, body, record, university, disciplineNames, base }: DefenseInput): Defense {
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
    university: defined({ slug: university.slug, name: university.name, country: university.country, website: university.website }),
    faculty: record.faculty,
    disciplines: (record.disciplines ?? []).map((slug) => ({ slug, name: disciplineNames[slug] ?? slug })),
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
