import { formatDateString, sameMonth, WEEKDAYS_SHORT, weeksOfMonth, type DateString } from '../lib/calendar.ts';
import { defensePhase, type Defense } from '../lib/defense.ts';
import { DefenseChip, fieldClass } from './DefenseChip.tsx';

interface MonthViewProps {
  date: DateString;
  groups: Map<DateString, Defense[]>;
  today: DateString;
  now: Date;
  zone: string | null;
  /** Narrow screens show dots instead of chips; tapping such a cell opens the day. */
  onOpenDay: (date: DateString) => void;
}

/** A Monday-start grid covering the month; padding days from the neighbours are dimmed but keep their chips. */
export function MonthView({ date, groups, today, now, zone, onOpenDay }: MonthViewProps) {
  return (
    <div className="month">
      <div className="month-dows" aria-hidden="true">
        {WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="month-dow">
            {d}
          </div>
        ))}
      </div>
      <div className="month-grid">
        {weeksOfMonth(date)
          .flat()
          .map((day) => {
            const items = groups.get(day) ?? [];
            const classes = ['month-cell', sameMonth(day, date) ? '' : 'month-cell-pad', day === today ? 'month-cell-today' : '']
              .filter(Boolean)
              .join(' ');
            return (
              <div key={day} className={classes}>
                <div className="month-num">{Number(day.slice(8))}</div>
                <div className="month-chips">
                  {items.map((d) => (
                    <DefenseChip key={d.key} defense={d} phase={defensePhase(d, now)} zone={zone} detail="month" />
                  ))}
                </div>
                {items.length > 0 && (
                  <>
                    <div className="month-dots" aria-hidden="true">
                      {items.map((d) => (
                        <span key={d.key} className={`month-dot ${fieldClass(d)}${defensePhase(d, now) === 'past' ? ' month-dot-past' : ''}`} />
                      ))}
                    </div>
                    <button type="button" className="month-open" aria-label={`Open ${formatDateString(day)}`} onClick={() => onOpenDay(day)}>
                      Open
                    </button>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
