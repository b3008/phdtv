import { useEffect, useMemo, useState } from 'react';
import {
  calendarFromSearch,
  DEFAULT_VIEW,
  groupByDate,
  periodBounds,
  searchFromState,
  todayIn,
  type CalendarState,
  type DateString,
} from '../lib/calendar.ts';
import { defensePhase, type Defense } from '../lib/defense.ts';
import { applyFilters, filtersFromSearch, type Filters } from '../lib/filters.ts';
import { CalendarToolbar } from './CalendarToolbar.tsx';
import { DayView } from './DayView.tsx';
import { DefenseCard } from './DefenseCard.tsx';
import { EmptyPeriod } from './EmptyPeriod.tsx';
import { FilterBar } from './FilterBar.tsx';
import { HeadlineStrip, headlines } from './HeadlineStrip.tsx';
import { MajorFieldLegend, type MajorField } from './MajorFieldLegend.tsx';
import { MonthView } from './MonthView.tsx';
import { PageIntro } from './PageIntro.tsx';
import { useViewerClock } from './useViewerClock.ts';
import { WeekView } from './WeekView.tsx';
import { YearView } from './YearView.tsx';

export interface DefenseCalendarProps {
  /** Every published defense, past and future. */
  defenses: Defense[];
  /** The major fields of the vocabulary, for the legend. */
  majors: MajorField[];
  /** Build time, so the first client render matches the server render before the real clock takes over. */
  renderedAt?: string;
}

const LEDE =
  'Public defenses streamed for free by universities, shown in your local time. Browse by day, week, month or year. Past dates show where a recording exists. Subscribe to the calendar feed to get them in your own calendar.';

function uniqueOptions(defenses: Defense[], pick: (d: Defense) => Array<{ slug: string; name: string }>) {
  const seen = new Map<string, string>();
  for (const d of defenses) for (const o of pick(d)) seen.set(o.slug, o.name);
  return [...seen].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The home page below the masthead. Before mount (the build output and the no-script fallback) it shows the
 * build month with each defense on its institution-local date; after mount the viewer's clock, zone and URL
 * take over.
 */
export function DefenseCalendar({ defenses, majors, renderedAt }: DefenseCalendarProps) {
  const clock = useViewerClock();
  const buildNow = renderedAt ? new Date(renderedAt) : new Date();
  const now = clock.now ?? buildNow;
  const zone = clock.zone;
  const today: DateString = zone ? todayIn(zone, now) : todayIn('UTC', now);

  const [filters, setFilters] = useState<Filters>({});
  const [calendar, setCalendar] = useState<CalendarState>(() => ({ view: DEFAULT_VIEW, date: todayIn('UTC', buildNow) }));

  useEffect(() => {
    const viewerZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setFilters(filtersFromSearch(window.location.search));
    setCalendar(calendarFromSearch(window.location.search, todayIn(viewerZone, new Date())));
  }, []);

  const writeUrl = (nextCalendar: CalendarState, nextFilters: Filters) => {
    window.history.replaceState(null, '', `${window.location.pathname}${searchFromState(nextCalendar, nextFilters, today)}`);
  };
  const updateFilters = (next: Filters) => {
    setFilters(next);
    writeUrl(calendar, next);
  };
  const updateCalendar = (next: CalendarState) => {
    setCalendar(next);
    writeUrl(next, filters);
  };

  const disciplines = useMemo(() => uniqueOptions(defenses, (d) => d.disciplines), [defenses]);
  const universities = useMemo(() => uniqueOptions(defenses, (d) => [d.university]), [defenses]);
  const presentMajors = useMemo(
    () => majors.filter((m) => defenses.some((d) => d.disciplines.some((x) => x.major === m.slug))),
    [majors, defenses],
  );
  const visible = useMemo(() => applyFilters(defenses, filters), [defenses, filters]);
  const groups = useMemo(() => groupByDate(visible, zone), [visible, zone]);
  const live = visible
    .filter((d) => defensePhase(d, now) === 'live')
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const bounds = periodBounds(calendar.view, calendar.date);
  const isEmpty = calendar.view !== 'year' && ![...groups.keys()].some((day) => day >= bounds.start && day <= bounds.end);

  return (
    <div className="calendar">
      <HeadlineStrip headlines={headlines(defenses, now, zone)} />
      <div className="column">
        <PageIntro kicker="Special issue" title="PhD defenses you can" highlight="watch live" lede={LEDE} />
        <FilterBar filters={filters} disciplines={disciplines} universities={universities} onChange={updateFilters} />
        <MajorFieldLegend majors={presentMajors} />
        {live.length > 0 && (
          <section className="live" aria-label="Live now">
            <h2 className="live-heading">Live now</h2>
            <span className="starburst" aria-hidden="true">
              On air!
            </span>
            {live.map((d) => (
              <DefenseCard key={d.key} defense={d} phase="live" now={now} viewerZone={zone} />
            ))}
          </section>
        )}
        <CalendarToolbar state={calendar} today={today} onChange={updateCalendar} />
        {isEmpty && <EmptyPeriod state={calendar} dates={groups.keys()} onJump={(date) => updateCalendar({ ...calendar, date })} />}
        {calendar.view === 'day' && !isEmpty && (
          <DayView date={calendar.date} defenses={groups.get(calendar.date) ?? []} now={now} zone={zone} />
        )}
        {calendar.view === 'week' && <WeekView date={calendar.date} groups={groups} today={today} now={now} zone={zone} />}
        {calendar.view === 'month' && (
          <MonthView
            date={calendar.date}
            groups={groups}
            today={today}
            now={now}
            zone={zone}
            onOpenDay={(date) => updateCalendar({ view: 'day', date })}
          />
        )}
        {calendar.view === 'year' && (
          <YearView
            date={calendar.date}
            groups={groups}
            onOpenMonth={(date) => updateCalendar({ view: 'month', date })}
            onOpenDay={(date) => updateCalendar({ view: 'day', date })}
          />
        )}
      </div>
    </div>
  );
}
