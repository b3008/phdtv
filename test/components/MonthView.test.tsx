// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MonthView } from '../../src/components/MonthView.tsx';
import { groupByDate } from '../../src/lib/calendar.ts';
import { fixtureDefense } from '../fixtures/defenses.ts';

const NOW = new Date('2026-09-07T11:20:00Z');
const seventh = fixtureDefense({ key: 'a', candidate: 'Seventh Person', startsAt: '2026-09-07T13:00:00+02:00', endsAt: '2026-09-07T12:00:00.000Z' });
const past = fixtureDefense({ key: 'b', candidate: 'August Person', startsAt: '2026-08-31T12:00:00+02:00', endsAt: '2026-08-31T11:00:00.000Z' });
const groups = groupByDate([seventh, past], 'Europe/Amsterdam');

describe('MonthView', () => {
  it('lays out September 2026 as five Monday-start rows with padding days', () => {
    const { container } = render(<MonthView date="2026-09-15" groups={groups} today="2026-09-07" now={NOW} zone="Europe/Amsterdam" onOpenDay={() => {}} />);
    const cells = container.querySelectorAll('.month-cell');
    expect(cells).toHaveLength(35);
    expect(cells[0]?.className).toContain('month-cell-pad');
    expect(cells[0]?.querySelector('.month-num')?.textContent).toBe('31');
    expect(cells[7]?.className).toContain('month-cell-today');
    expect(cells[34]?.querySelector('.month-num')?.textContent).toBe('4');
  });

  it('keeps chips on padding days and opens a day from its cell', () => {
    const onOpenDay = vi.fn();
    render(<MonthView date="2026-09-15" groups={groups} today="2026-09-07" now={NOW} zone="Europe/Amsterdam" onOpenDay={onOpenDay} />);
    expect(screen.getByRole('link', { name: /August Person/ }).className).toContain('chip-past');
    expect(screen.getByRole('link', { name: /Seventh Person/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open Mon 7 Sep 2026' }));
    expect(onOpenDay).toHaveBeenCalledWith('2026-09-07');
    expect(screen.queryByRole('button', { name: 'Open Tue 8 Sep 2026' })).toBeNull();
  });
});
