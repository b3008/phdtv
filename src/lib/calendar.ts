// Calendar arithmetic on YYYY-MM-DD strings. No instants and no zones inside, so daylight-saving time cannot
// move a date; the only zone-aware step is turning a defense's instant into a date, done via localDateString.
import type { Defense } from './defense.ts';
import { searchFromFilters, type Filters } from './filters.ts';
import { localDateString } from './time.ts';

export type CalendarView = 'day' | 'week' | 'month' | 'year';
export const CALENDAR_VIEWS: readonly CalendarView[] = ['day', 'week', 'month', 'year'];
export const DEFAULT_VIEW: CalendarView = 'month';

/** A calendar date as YYYY-MM-DD with no zone attached. */
export type DateString = string;

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

interface Parts {
  year: number;
  /** 1 to 12. */
  month: number;
  day: number;
}

function parts(date: DateString): Parts {
  const [year, month, day] = date.split('-').map(Number);
  return { year: year ?? 0, month: month ?? 0, day: day ?? 0 };
}

function fromParts(year: number, month: number, day: number): DateString {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toUtc(date: DateString): Date {
  const p = parts(date);
  return new Date(Date.UTC(p.year, p.month - 1, p.day));
}

function fromUtc(at: Date): DateString {
  return fromParts(at.getUTCFullYear(), at.getUTCMonth() + 1, at.getUTCDate());
}

/** True for a well-formed date that exists, so 2026-02-30 is rejected. */
export function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && fromUtc(toUtc(value)) === value;
}

export function isCalendarView(value: string): value is CalendarView {
  return (CALENDAR_VIEWS as readonly string[]).includes(value);
}

export function addDays(date: DateString, days: number): DateString {
  const at = toUtc(date);
  at.setUTCDate(at.getUTCDate() + days);
  return fromUtc(at);
}

/** `month` is 1 to 12. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 0 for Monday through 6 for Sunday. */
export function weekdayIndex(date: DateString): number {
  return (toUtc(date).getUTCDay() + 6) % 7;
}

export function startOfWeek(date: DateString): DateString {
  return addDays(date, -weekdayIndex(date));
}

export function daysOfWeek(date: DateString): DateString[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function startOfMonth(date: DateString): DateString {
  const p = parts(date);
  return fromParts(p.year, p.month, 1);
}

export function endOfMonth(date: DateString): DateString {
  const p = parts(date);
  return fromParts(p.year, p.month, daysInMonth(p.year, p.month));
}

/**
 * Monday-start rows of seven dates covering the month, padded with days of the neighbouring months.
 * `rows` forces a fixed count (six keeps mini-months the same height).
 */
export function weeksOfMonth(date: DateString, rows?: number): DateString[][] {
  const first = startOfMonth(date);
  const lead = weekdayIndex(first);
  const p = parts(date);
  const count = rows ?? Math.ceil((lead + daysInMonth(p.year, p.month)) / 7);
  const start = addDays(first, -lead);
  return Array.from({ length: count }, (_, row) => Array.from({ length: 7 }, (_, col) => addDays(start, row * 7 + col)));
}

export function monthsOfYear(date: DateString): DateString[] {
  const { year } = parts(date);
  return Array.from({ length: 12 }, (_, i) => fromParts(year, i + 1, 1));
}

export function sameMonth(a: DateString, b: DateString): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

/** Move by `delta` units of the view; month and year moves clamp the day to the target month's length. */
export function shift(date: DateString, view: CalendarView, delta: number): DateString {
  const p = parts(date);
  switch (view) {
    case 'day':
      return addDays(date, delta);
    case 'week':
      return addDays(date, 7 * delta);
    case 'month': {
      const index = p.year * 12 + (p.month - 1) + delta;
      const year = Math.floor(index / 12);
      const month = (index % 12) + 1;
      return fromParts(year, month, Math.min(p.day, daysInMonth(year, month)));
    }
    case 'year':
      return fromParts(p.year + delta, p.month, Math.min(p.day, daysInMonth(p.year + delta, p.month)));
  }
}

export interface Period {
  start: DateString;
  end: DateString;
}

export function periodBounds(view: CalendarView, date: DateString): Period {
  switch (view) {
    case 'day':
      return { start: date, end: date };
    case 'week': {
      const start = startOfWeek(date);
      return { start, end: addDays(start, 6) };
    }
    case 'month':
      return { start: startOfMonth(date), end: endOfMonth(date) };
    case 'year': {
      const { year } = parts(date);
      return { start: fromParts(year, 1, 1), end: fromParts(year, 12, 31) };
    }
  }
}

/** e.g. "Tue 15 Sep 2026", the same shape formatDate in time.ts gives an instant. */
export function formatDateString(date: DateString): string {
  const p = parts(date);
  return `${WEEKDAYS_SHORT[weekdayIndex(date)]} ${p.day} ${MONTHS_SHORT[p.month - 1]} ${p.year}`;
}

/** e.g. "Tuesday 15 September 2026". */
export function formatDateLong(date: DateString): string {
  const p = parts(date);
  return `${WEEKDAYS[weekdayIndex(date)]} ${p.day} ${MONTHS[p.month - 1]} ${p.year}`;
}

export function periodLabel(view: CalendarView, date: DateString): string {
  const p = parts(date);
  switch (view) {
    case 'day':
      return formatDateString(date);
    case 'week': {
      const { start, end } = periodBounds('week', date);
      const a = parts(start);
      const b = parts(end);
      if (a.year !== b.year) return `${a.day} ${MONTHS_SHORT[a.month - 1]} ${a.year} – ${b.day} ${MONTHS_SHORT[b.month - 1]} ${b.year}`;
      if (a.month !== b.month) return `${a.day} ${MONTHS_SHORT[a.month - 1]} – ${b.day} ${MONTHS_SHORT[b.month - 1]} ${b.year}`;
      return `${a.day} – ${b.day} ${MONTHS_SHORT[a.month - 1]} ${a.year}`;
    }
    case 'month':
      return `${MONTHS[p.month - 1]} ${p.year}`;
    case 'year':
      return String(p.year);
  }
}

/**
 * Defenses by the date they fall on in `zone`, or in each defense's own institution zone when `zone` is null
 * (the build-time render, which has no viewer). Each day's list is sorted by instant.
 */
export function groupByDate(defenses: Defense[], zone: string | null): Map<DateString, Defense[]> {
  const groups = new Map<DateString, Defense[]>();
  const sorted = [...defenses].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  for (const defense of sorted) {
    const key = localDateString(zone ?? defense.timezone, new Date(defense.startsAt));
    const list = groups.get(key);
    if (list) list.push(defense);
    else groups.set(key, [defense]);
  }
  return groups;
}

/** The nearest date strictly before the period (direction -1) or strictly after it (direction 1). */
export function nearestDate(dates: Iterable<DateString>, period: Period, direction: -1 | 1): DateString | undefined {
  let best: DateString | undefined;
  for (const date of dates) {
    const outside = direction < 0 ? date < period.start : date > period.end;
    if (!outside) continue;
    if (best === undefined || (direction < 0 ? date > best : date < best)) best = date;
  }
  return best;
}

export interface CalendarState {
  view: CalendarView;
  date: DateString;
}

/** View and anchor date from the query; anything unrecognised falls back to the month view on `today`. */
export function calendarFromSearch(search: string, today: DateString): CalendarState {
  const params = new URLSearchParams(search);
  const view = params.get('view') ?? '';
  const date = params.get('date') ?? '';
  return { view: isCalendarView(view) ? view : DEFAULT_VIEW, date: isDateString(date) ? date : today };
}

/** One query string for the filters and the calendar state, omitting parameters at their defaults. */
export function searchFromState(state: CalendarState, filters: Filters, today: DateString): string {
  const params = new URLSearchParams(searchFromFilters(filters));
  if (state.view !== DEFAULT_VIEW) params.set('view', state.view);
  if (state.date !== today) params.set('date', state.date);
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** Today's date in a zone; the build uses UTC because it has no viewer. */
export function todayIn(zone: string, now: Date): DateString {
  return localDateString(zone, now);
}
