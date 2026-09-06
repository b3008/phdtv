import { formatDateLong, type DateString } from '../lib/calendar.ts';
import { defensePhase, type Defense } from '../lib/defense.ts';
import { DefenseCard } from './DefenseCard.tsx';

interface DayViewProps {
  date: DateString;
  /** The defenses of that day, already sorted by start. */
  defenses: Defense[];
  now: Date;
  zone: string | null;
}

/** One day: the date spelled out, then full cards. The parent renders the empty state instead when there is nothing. */
export function DayView({ date, defenses, now, zone }: DayViewProps) {
  return (
    <section className="day-view">
      <h2 className="day-heading">{formatDateLong(date)}</h2>
      {defenses.map((d) => (
        <DefenseCard key={d.key} defense={d} phase={defensePhase(d, now)} now={now} viewerZone={zone} />
      ))}
    </section>
  );
}
