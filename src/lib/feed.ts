import type { Defense } from './defense.ts';
import type { FileHistory } from './git-meta.ts';
import type { IcsEvent } from './ics.ts';
import { RECORDING_PENDING_DAYS } from './recording.ts';
import { formatDate, formatTime, zoneAbbreviation } from './time.ts';

export interface FeedOptions {
  histories: Map<string, FileHistory>;
  now: Date;
  /** Site origin used to make page URLs absolute. */
  site: string;
}

/** A defense belongs in the feed while upcoming and for 30 days after it ends. */
export function inFeedWindow(defense: Defense, now: Date): boolean {
  const end = new Date(defense.endsAt);
  return now.getTime() - end.getTime() < RECORDING_PENDING_DAYS * 86_400_000;
}

function describe(defense: Defense): string {
  const at = new Date(defense.startsAt);
  const lines = [
    defense.stream ? `Stream: ${defense.stream.url}` : 'Stream link not yet announced',
    `${defense.university.name}, ${formatDate(defense.startsAt, defense.timezone)} ${formatTime(defense.startsAt, defense.timezone)} ${zoneAbbreviation(defense.timezone, at)}`,
  ];
  if (defense.recording && 'url' in defense.recording) lines.push(`Recording: ${defense.recording.url}`);
  if (defense.disciplines.length > 0) lines.push(defense.disciplines.map((d) => d.name).join(', '));
  return lines.join('\n');
}

export function feedEvents(defenses: Defense[], { histories, now, site }: FeedOptions): IcsEvent[] {
  return defenses.filter((d) => inFeedWindow(d, now)).map((defense) => {
    const history = histories.get(`records/${defense.key}.md`);
    return {
      uid: `${defense.key}@phdtv`,
      start: new Date(defense.startsAt),
      durationMinutes: defense.durationMinutes,
      summary: `${defense.candidate}: ${defense.title}`,
      description: describe(defense),
      location: defense.university.name,
      url: new URL(defense.url, site).href,
      sequence: history?.commits ?? 0,
      stamp: history?.lastCommitAt ?? now,
    };
  });
}
