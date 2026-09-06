import { daysOfWeek, formatDateString, WEEKDAYS_SHORT, type DateString } from '../lib/calendar.ts';
import { defensePhase, type Defense } from '../lib/defense.ts';
import { DefenseChip } from './DefenseChip.tsx';

interface WeekViewProps {
  date: DateString;
  groups: Map<DateString, Defense[]>;
  today: DateString;
  now: Date;
  zone: string | null;
}

/** Seven Monday-start columns of chips; today's header carries the NOW tag. */
export function WeekView({ date, groups, today, now, zone }: WeekViewProps) {
  return (
    <div className="week">
      {daysOfWeek(date).map((day, i) => {
        const isToday = day === today;
        return (
          <section key={day} className={`week-day${isToday ? ' week-day-today' : ''}`} aria-label={formatDateString(day)}>
            <div className="week-head">
              <div className="week-head-dow">{WEEKDAYS_SHORT[i]}</div>
              <div className="week-head-num">
                {Number(day.slice(8))}
                {isToday && <span className="tag-now">Now</span>}
              </div>
            </div>
            <div className="week-chips">
              {(groups.get(day) ?? []).map((d) => (
                <DefenseChip key={d.key} defense={d} phase={defensePhase(d, now)} zone={zone} detail="week" />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
