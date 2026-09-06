import { describe, expect, it } from 'vitest';
import {
  addDays,
  calendarFromSearch,
  daysInMonth,
  daysOfWeek,
  formatDateLong,
  formatDateString,
  groupByDate,
  isDateString,
  monthsOfYear,
  nearestDate,
  periodBounds,
  periodLabel,
  searchFromState,
  shift,
  startOfWeek,
  todayIn,
  weeksOfMonth,
} from '../../src/lib/calendar.ts';
import { fixtureDefense } from '../fixtures/defenses.ts';

describe('date strings', () => {
  it('validates the shape and the calendar', () => {
    expect(isDateString('2026-09-15')).toBe(true);
    expect(isDateString('2026-02-30')).toBe(false);
    expect(isDateString('15-09-2026')).toBe(false);
    expect(isDateString('')).toBe(false);
  });
  it('adds days across month and year edges', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });
  it('knows month lengths and leap years', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
  it('gives today in a zone', () => {
    expect(todayIn('Europe/Amsterdam', new Date('2026-09-15T22:30:00Z'))).toBe('2026-09-16');
    expect(todayIn('UTC', new Date('2026-09-15T22:30:00Z'))).toBe('2026-09-15');
  });
});

describe('weeks and months', () => {
  it('starts weeks on Monday', () => {
    expect(startOfWeek('2026-09-06')).toBe('2026-08-31');
    expect(startOfWeek('2026-08-31')).toBe('2026-08-31');
    expect(startOfWeek('2026-01-01')).toBe('2025-12-29');
    expect(daysOfWeek('2026-09-09')).toEqual(['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13']);
  });
  it('covers a month with Monday-start rows padded from the neighbours', () => {
    const rows = weeksOfMonth('2026-09-15');
    expect(rows).toHaveLength(5);
    expect(rows[0]?.[0]).toBe('2026-08-31');
    expect(rows[4]?.[6]).toBe('2026-10-04');
  });
  it('needs six rows for a month that starts late in the week', () => {
    expect(weeksOfMonth('2026-08-15')).toHaveLength(6);
  });
  it('can force six rows for aligned mini-months', () => {
    const rows = weeksOfMonth('2026-09-15', 6);
    expect(rows).toHaveLength(6);
    expect(rows[5]?.[6]).toBe('2026-10-11');
  });
  it('lists the first of every month of a year', () => {
    const months = monthsOfYear('2026-09-15');
    expect(months).toHaveLength(12);
    expect(months[0]).toBe('2026-01-01');
    expect(months[11]).toBe('2026-12-01');
  });
});

describe('shift', () => {
  it('moves by a day or a week', () => {
    expect(shift('2026-09-07', 'day', 1)).toBe('2026-09-08');
    expect(shift('2026-09-07', 'week', -1)).toBe('2026-08-31');
  });
  it('moves by a month and clamps to the last day', () => {
    expect(shift('2026-01-31', 'month', 1)).toBe('2026-02-28');
    expect(shift('2026-12-15', 'month', 1)).toBe('2027-01-15');
    expect(shift('2026-01-15', 'month', -1)).toBe('2025-12-15');
  });
  it('moves by a year and clamps 29 February', () => {
    expect(shift('2028-02-29', 'year', 1)).toBe('2029-02-28');
    expect(shift('2026-09-07', 'year', -1)).toBe('2025-09-07');
  });
});

describe('periods and labels', () => {
  it('bounds each view', () => {
    expect(periodBounds('day', '2026-09-15')).toEqual({ start: '2026-09-15', end: '2026-09-15' });
    expect(periodBounds('week', '2026-09-16')).toEqual({ start: '2026-09-14', end: '2026-09-20' });
    expect(periodBounds('month', '2026-09-16')).toEqual({ start: '2026-09-01', end: '2026-09-30' });
    expect(periodBounds('year', '2026-09-16')).toEqual({ start: '2026-01-01', end: '2026-12-31' });
  });
  it('formats dates like the rest of the site', () => {
    expect(formatDateString('2026-09-15')).toBe('Tue 15 Sep 2026');
    expect(formatDateLong('2026-09-07')).toBe('Monday 7 September 2026');
  });
  it('labels periods, with the week label folding shared month and year', () => {
    expect(periodLabel('day', '2026-09-15')).toBe('Tue 15 Sep 2026');
    expect(periodLabel('week', '2026-09-16')).toBe('14 – 20 Sep 2026');
    expect(periodLabel('week', '2026-09-30')).toBe('28 Sep – 4 Oct 2026');
    expect(periodLabel('week', '2026-01-01')).toBe('29 Dec 2025 – 4 Jan 2026');
    expect(periodLabel('month', '2026-09-16')).toBe('September 2026');
    expect(periodLabel('year', '2026-09-16')).toBe('2026');
  });
});

describe('groupByDate', () => {
  const late = fixtureDefense({ key: 'late', startsAt: '2026-09-16T00:30:00+02:00', endsAt: '2026-09-15T23:30:00.000Z' });
  const noon = fixtureDefense({ key: 'noon', startsAt: '2026-09-15T12:00:00+02:00', endsAt: '2026-09-15T11:00:00.000Z' });
  const morning = fixtureDefense({ key: 'morning', startsAt: '2026-09-15T09:00:00+03:00', endsAt: '2026-09-15T07:00:00.000Z', timezone: 'Europe/Helsinki' });

  it('places a defense on the date it falls on in the given zone', () => {
    expect([...groupByDate([late], 'Europe/Amsterdam').keys()]).toEqual(['2026-09-16']);
    expect([...groupByDate([late], 'America/New_York').keys()]).toEqual(['2026-09-15']);
  });
  it('uses each institution zone when no viewer zone is known', () => {
    expect([...groupByDate([late], null).keys()]).toEqual(['2026-09-16']);
  });
  it('sorts a day by instant, not by the text of the timestamp', () => {
    const groups = groupByDate([noon, morning], 'Europe/Amsterdam');
    expect(groups.get('2026-09-15')?.map((d) => d.key)).toEqual(['morning', 'noon']);
  });
});

describe('nearestDate', () => {
  const dates = ['2026-07-01', '2026-08-28', '2026-09-07', '2026-09-09'];
  const period = periodBounds('week', '2026-09-01');
  it('finds the closest date before and after a period', () => {
    expect(nearestDate(dates, period, -1)).toBe('2026-08-28');
    expect(nearestDate(dates, period, 1)).toBe('2026-09-07');
  });
  it('is undefined when nothing lies in that direction', () => {
    expect(nearestDate(['2026-09-07'], period, -1)).toBeUndefined();
    expect(nearestDate([], period, 1)).toBeUndefined();
  });
});

describe('calendar state in the query string', () => {
  const today = '2026-09-07';
  it('reads a view and a date', () => {
    expect(calendarFromSearch('?view=week&date=2026-09-14', today)).toEqual({ view: 'week', date: '2026-09-14' });
  });
  it('falls back to month and today for missing or bad values', () => {
    expect(calendarFromSearch('', today)).toEqual({ view: 'month', date: today });
    expect(calendarFromSearch('?view=bogus&date=2026-02-30', today)).toEqual({ view: 'month', date: today });
  });
  it('writes filters first and omits defaults', () => {
    expect(searchFromState({ view: 'month', date: today }, {}, today)).toBe('');
    expect(searchFromState({ view: 'week', date: '2026-09-14' }, { discipline: 'law' }, today)).toBe('?discipline=law&view=week&date=2026-09-14');
    expect(searchFromState({ view: 'month', date: '2026-10-07' }, { recordedOnly: true }, today)).toBe('?recorded=1&date=2026-10-07');
  });
});
