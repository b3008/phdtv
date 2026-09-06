import { defensePhase, institutionLabel, type Defense } from '../lib/defense.ts';
import { formatDate } from '../lib/time.ts';

interface HeadlineStripProps {
  /** From headlines(): the calendar island computes them from the viewer's clock, other pages at build time. */
  headlines: Headline[];
}

export interface Headline {
  kind: 'live' | 'upcoming' | 'recordings';
  kicker: string;
  text: string;
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * What is on air (or next), how many defenses are still to come, how many recordings exist. Describes the
 * whole listing, never the filtered view; `zone` is the viewer's zone once known, for the date of the next defense.
 */
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
export function HeadlineStrip({ headlines: items }: HeadlineStripProps) {
  return (
    <div className="headlines-band">
      <ul className="column headlines" aria-label="Headlines">
        {items.map((h) => (
          <li key={h.kind} className={`headline headline-${h.kind}`}>
            <span className="headline-kicker">{h.kicker}</span>
            <span className="headline-text">{h.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
