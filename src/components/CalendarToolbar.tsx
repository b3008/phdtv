import { CALENDAR_VIEWS, periodLabel, shift, type CalendarState, type CalendarView, type DateString } from '../lib/calendar.ts';

interface CalendarToolbarProps {
  state: CalendarState;
  today: DateString;
  onChange: (next: CalendarState) => void;
}

const VIEW_LABELS: Record<CalendarView, string> = { day: 'Day', week: 'Week', month: 'Month', year: 'Year' };

/** Previous, next and Today; the period label; the view switcher. Switching views keeps the anchor date. */
export function CalendarToolbar({ state, today, onChange }: CalendarToolbarProps) {
  const step = (delta: -1 | 1) => onChange({ ...state, date: shift(state.date, state.view, delta) });
  return (
    <div className="toolbar">
      <div className="toolbar-nav">
        <button type="button" className="toolbar-step" aria-label={`Previous ${state.view}`} onClick={() => step(-1)}>
          ‹
        </button>
        <button type="button" className="toolbar-step" aria-label={`Next ${state.view}`} onClick={() => step(1)}>
          ›
        </button>
        <button type="button" onClick={() => onChange({ ...state, date: today })}>
          Today
        </button>
      </div>
      <span className="toolbar-period">{periodLabel(state.view, state.date)}</span>
      <div className="toolbar-views" role="group" aria-label="View">
        {CALENDAR_VIEWS.map((view) => (
          <button key={view} type="button" aria-pressed={view === state.view} onClick={() => onChange({ ...state, view })}>
            {VIEW_LABELS[view]}
          </button>
        ))}
      </div>
    </div>
  );
}
