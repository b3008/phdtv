// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { shadeLevel, YearView } from '../../src/components/YearView.tsx';
import { groupByDate } from '../../src/lib/calendar.ts';
import { fixtureDefense } from '../fixtures/defenses.ts';

const one = (key: string, startsAt: string) => fixtureDefense({ key, startsAt, endsAt: new Date(new Date(startsAt).getTime() + 3_600_000).toISOString() });
const groups = groupByDate(
  [one('a', '2026-09-07T13:00:00+02:00'), one('b', '2026-09-24T10:30:00+02:00'), one('c', '2026-09-24T16:30:00+02:00'), one('d', '2026-07-01T11:00:00+02:00')],
  'Europe/Amsterdam',
);

describe('YearView', () => {
  it('shows twelve six-row mini-months with counts', () => {
    const { container } = render(<YearView date="2026-09-15" groups={groups} onOpenMonth={() => {}} onOpenDay={() => {}} />);
    const months = screen.getAllByRole('group');
    expect(months).toHaveLength(12);
    expect(months[0]?.getAttribute('aria-label')).toBe('January 2026');
    expect(container.querySelectorAll('.year-month:first-child .year-day')).toHaveLength(42);
    expect(within(months[8] as HTMLElement).getByText('3 defenses')).toBeTruthy();
    expect(within(months[6] as HTMLElement).getByText('1 defense')).toBeTruthy();
    expect(within(months[0] as HTMLElement).getByText('0 defenses')).toBeTruthy();
  });

  it('shades days by count and opens a month or a day', () => {
    const onOpenMonth = vi.fn();
    const onOpenDay = vi.fn();
    render(<YearView date="2026-09-15" groups={groups} onOpenMonth={onOpenMonth} onOpenDay={onOpenDay} />);
    const day = screen.getByRole('button', { name: 'Thu 24 Sep 2026, 2 defenses' });
    expect(day.className).toContain('year-day-2');
    fireEvent.click(day);
    expect(onOpenDay).toHaveBeenCalledWith('2026-09-24');
    fireEvent.click(screen.getByRole('button', { name: 'September' }));
    expect(onOpenMonth).toHaveBeenCalledWith('2026-09-01');
    expect(screen.queryByRole('button', { name: /Tue 8 Sep 2026/ })).toBeNull();
    expect(shadeLevel(0)).toBe(0);
    expect(shadeLevel(5)).toBe(3);
  });
});
