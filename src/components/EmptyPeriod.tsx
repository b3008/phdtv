import { formatDateString, nearestDate, periodBounds, periodLabel, type CalendarState, type DateString } from '../lib/calendar.ts';

interface EmptyPeriodProps {
  state: CalendarState;
  /** Every date that has a defense under the current filters. */
  dates: Iterable<DateString>;
  onJump: (date: DateString) => void;
}

export function emptyMessage(state: CalendarState): string {
  switch (state.view) {
    case 'day':
      return `No defenses on ${formatDateString(state.date)}.`;
    case 'week':
      return 'No defenses this week.';
    case 'month':
      return `No defenses in ${periodLabel('month', state.date)}.`;
    case 'year':
      return `No defenses in ${periodLabel('year', state.date)}.`;
  }
}

/** The empty-period sentence with jumps to the nearest defense before and after, when there is one. */
export function EmptyPeriod({ state, dates, onJump }: EmptyPeriodProps) {
  const bounds = periodBounds(state.view, state.date);
  const list = [...dates];
  const previous = nearestDate(list, bounds, -1);
  const next = nearestDate(list, bounds, 1);
  return (
    <div className="empty-period" role="status">
      <p>{emptyMessage(state)}</p>
      {(previous || next) && (
        <div className="empty-period-links">
          {previous && (
            <button type="button" className="link-button" onClick={() => onJump(previous)}>
              Previous: {formatDateString(previous)}
            </button>
          )}
          {next && (
            <button type="button" className="link-button" onClick={() => onJump(next)}>
              Next: {formatDateString(next)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
