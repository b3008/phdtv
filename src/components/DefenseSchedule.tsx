import { useEffect, useMemo, useState } from 'react';
import type { Defense } from '../lib/defense.ts';
import { applyFilters, filtersFromSearch, searchFromFilters, type Filters } from '../lib/filters.ts';
import { classify, formatDate, localDateString } from '../lib/time.ts';
import { DefenseCard } from './DefenseCard.tsx';
import { FilterBar } from './FilterBar.tsx';
import { useViewerClock } from './useViewerClock.ts';

interface DefenseScheduleProps {
  mode: 'upcoming' | 'archive';
  defenses: Defense[];
  /** Build time, so the first client render matches the server render before the real clock takes over. */
  renderedAt?: string;
}

const scheduled = (d: Defense) => ({ starts_at: d.startsAt, timezone: d.timezone, duration_minutes: d.durationMinutes });

function uniqueOptions(defenses: Defense[], pick: (d: Defense) => Array<{ slug: string; name: string }>) {
  const seen = new Map<string, string>();
  for (const d of defenses) for (const o of pick(d)) seen.set(o.slug, o.name);
  return [...seen].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
}

/** The upcoming and archive views. Hydrated by src/site/client/schedule.tsx; the static markup is the no-script fallback. */
export function DefenseSchedule({ mode, defenses, renderedAt }: DefenseScheduleProps) {
  const clock = useViewerClock();
  const [filters, setFilters] = useState<Filters>({});
  useEffect(() => {
    setFilters(filtersFromSearch(window.location.search));
  }, []);

  const now = clock.now ?? (renderedAt ? new Date(renderedAt) : new Date());
  const updateFilters = (next: Filters) => {
    setFilters(next);
    window.history.replaceState(null, '', `${window.location.pathname}${searchFromFilters(next)}`);
  };

  const disciplines = useMemo(() => uniqueOptions(defenses, (d) => d.disciplines), [defenses]);
  const universities = useMemo(() => uniqueOptions(defenses, (d) => [d.university]), [defenses]);

  const visible = applyFilters(defenses, filters).map((d) => ({ defense: d, phase: classify(scheduled(d), now) }));
  const byStart = (a: { defense: Defense }, b: { defense: Defense }) => a.defense.startsAt.localeCompare(b.defense.startsAt);

  const live = visible.filter((v) => v.phase === 'live').sort(byStart);
  const upcoming = visible.filter((v) => v.phase === 'upcoming').sort(byStart);
  const past = visible.filter((v) => v.phase === 'past').sort(byStart).reverse();

  const groupZone = (d: Defense) => clock.zone ?? d.timezone;
  const days = new Map<string, { label: string; items: typeof upcoming }>();
  for (const item of upcoming) {
    const key = localDateString(groupZone(item.defense), new Date(item.defense.startsAt));
    const group = days.get(key) ?? { label: formatDate(item.defense.startsAt, groupZone(item.defense)), items: [] };
    group.items.push(item);
    days.set(key, group);
  }

  const card = (item: { defense: Defense; phase: ReturnType<typeof classify> }) => (
    <DefenseCard key={item.defense.key} defense={item.defense} phase={item.phase} now={now} viewerZone={clock.zone} mode={mode} />
  );

  return (
    <div className={`schedule schedule-${mode}`}>
      <FilterBar
        filters={filters}
        disciplines={disciplines}
        universities={universities}
        showRecordedOnly={mode === 'archive'}
        onChange={updateFilters}
      />
      {mode === 'upcoming' && live.length > 0 && (
        <section className="live" aria-label="Live now">
          <h2 className="live-heading">Live now</h2>
          {live.map(card)}
        </section>
      )}
      {mode === 'upcoming' &&
        (upcoming.length === 0 ? (
          <p className="empty">No upcoming defenses are listed yet.</p>
        ) : (
          [...days.entries()].map(([key, group]) => (
            <section key={key} className="day">
              <h2 className="day-heading">{group.label}</h2>
              {group.items.map(card)}
            </section>
          ))
        ))}
      {mode === 'archive' &&
        (past.length === 0 ? <p className="empty">No past defenses are listed yet.</p> : <section className="past">{past.map(card)}</section>)}
    </div>
  );
}
