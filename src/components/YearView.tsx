import { formatDateString, MONTHS, monthsOfYear, sameMonth, weeksOfMonth, type DateString } from '../lib/calendar.ts';
import type { Defense } from '../lib/defense.ts';

interface YearViewProps {
  date: DateString;
  groups: Map<DateString, Defense[]>;
  onOpenMonth: (firstOfMonth: DateString) => void;
  onOpenDay: (date: DateString) => void;
}

const DOW_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Shading step for a day: none, one, two, three or more. */
export function shadeLevel(count: number): 0 | 1 | 2 | 3 {
  if (count >= 3) return 3;
  if (count === 2) return 2;
  return count === 1 ? 1 : 0;
}

const plural = (n: number) => `${n} ${n === 1 ? 'defense' : 'defenses'}`;

/** Twelve mini-months, six rows each, with days shaded by count; names open the month, shaded days open the day. */
export function YearView({ date, groups, onOpenMonth, onOpenDay }: YearViewProps) {
  return (
    <div className="year">
      {monthsOfYear(date).map((first) => {
        const cells = weeksOfMonth(first, 6).flat();
        const count = cells.filter((day) => sameMonth(day, first)).reduce((sum, day) => sum + (groups.get(day)?.length ?? 0), 0);
        const name = MONTHS[Number(first.slice(5, 7)) - 1] ?? '';
        return (
          <section key={first} className="year-month" aria-label={`${name} ${first.slice(0, 4)}`}>
            <button type="button" className="year-month-name" onClick={() => onOpenMonth(first)}>
              {name}
            </button>
            <div className="year-grid">
              {DOW_INITIALS.map((d, i) => (
                <div key={i} className="year-dow" aria-hidden="true">
                  {d}
                </div>
              ))}
              {cells.map((day) => {
                if (!sameMonth(day, first)) return <span key={day} className="year-day year-day-pad" aria-hidden="true" />;
                const n = groups.get(day)?.length ?? 0;
                const number = Number(day.slice(8));
                if (n === 0) {
                  return (
                    <span key={day} className="year-day year-day-0">
                      {number}
                    </span>
                  );
                }
                return (
                  <button
                    key={day}
                    type="button"
                    className={`year-day year-day-${shadeLevel(n)}`}
                    aria-label={`${formatDateString(day)}, ${plural(n)}`}
                    onClick={() => onOpenDay(day)}
                  >
                    {number}
                  </button>
                );
              })}
            </div>
            <p className="year-caption">{plural(count)}</p>
          </section>
        );
      })}
    </div>
  );
}
