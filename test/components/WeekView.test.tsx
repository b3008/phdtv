// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeekView } from '../../src/components/WeekView.tsx';
import { groupByDate } from '../../src/lib/calendar.ts';
import { fixtureDefense } from '../fixtures/defenses.ts';

const NOW = new Date('2026-09-07T11:20:00Z');
const monday = fixtureDefense({ key: 'mon', candidate: 'Monday Person', startsAt: '2026-09-07T13:00:00+02:00', endsAt: '2026-09-07T12:00:00.000Z' });
const wednesday = fixtureDefense({ key: 'wed', candidate: 'Wednesday Person', startsAt: '2026-09-09T09:00:00+02:00', endsAt: '2026-09-09T08:00:00.000Z' });
const groups = groupByDate([monday, wednesday], 'Europe/Amsterdam');

describe('WeekView', () => {
  it('renders seven Monday-start columns with the chips in the right days', () => {
    render(<WeekView date="2026-09-09" groups={groups} today="2026-09-07" now={NOW} zone="Europe/Amsterdam" />);
    const days = screen.getAllByRole('region');
    expect(days.map((d) => d.getAttribute('aria-label'))).toEqual([
      'Mon 7 Sep 2026', 'Tue 8 Sep 2026', 'Wed 9 Sep 2026', 'Thu 10 Sep 2026', 'Fri 11 Sep 2026', 'Sat 12 Sep 2026', 'Sun 13 Sep 2026',
    ]);
    expect(within(days[2] as HTMLElement).getByRole('link', { name: /Wednesday Person/ })).toBeTruthy();
    expect(within(days[1] as HTMLElement).queryByRole('link')).toBeNull();
  });

  it('marks today with the NOW tag and a live chip', () => {
    render(<WeekView date="2026-09-09" groups={groups} today="2026-09-07" now={NOW} zone="Europe/Amsterdam" />);
    const today = screen.getByRole('region', { name: 'Mon 7 Sep 2026' });
    expect(today.className).toContain('week-day-today');
    expect(within(today).getByText('Now')).toBeTruthy();
    expect(within(today).getByText('Live')).toBeTruthy();
    expect(within(today).getByText('TU Delft')).toBeTruthy();
  });
});
