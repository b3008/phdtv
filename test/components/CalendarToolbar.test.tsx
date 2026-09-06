// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalendarToolbar } from '../../src/components/CalendarToolbar.tsx';

describe('CalendarToolbar', () => {
  const state = { view: 'month' as const, date: '2026-09-15' };

  it('shows the period label and marks the active view', () => {
    render(<CalendarToolbar state={state} today="2026-09-07" onChange={() => {}} />);
    expect(screen.getByText('September 2026')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Month', pressed: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Week', pressed: false })).toBeTruthy();
  });

  it('steps by one unit of the view, jumps to today and switches views keeping the date', () => {
    const onChange = vi.fn();
    render(<CalendarToolbar state={state} today="2026-09-07" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(onChange).toHaveBeenLastCalledWith({ view: 'month', date: '2026-10-15' });
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(onChange).toHaveBeenLastCalledWith({ view: 'month', date: '2026-08-15' });
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenLastCalledWith({ view: 'month', date: '2026-09-07' });
    fireEvent.click(screen.getByRole('button', { name: 'Week' }));
    expect(onChange).toHaveBeenLastCalledWith({ view: 'week', date: '2026-09-15' });
  });

  it('names the step buttons after the view', () => {
    render(<CalendarToolbar state={{ view: 'year', date: '2026-09-15' }} today="2026-09-07" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next year' })).toBeTruthy();
    expect(screen.getByText('2026')).toBeTruthy();
  });
});
