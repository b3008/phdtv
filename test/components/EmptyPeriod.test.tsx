// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyPeriod, emptyMessage } from '../../src/components/EmptyPeriod.tsx';

const dates = ['2026-07-01', '2026-09-16', '2026-10-02'];

describe('EmptyPeriod', () => {
  it('names the empty period per view', () => {
    expect(emptyMessage({ view: 'day', date: '2026-09-22' })).toBe('No defenses on Tue 22 Sep 2026.');
    expect(emptyMessage({ view: 'week', date: '2026-09-22' })).toBe('No defenses this week.');
    expect(emptyMessage({ view: 'month', date: '2026-11-03' })).toBe('No defenses in November 2026.');
  });

  it('offers the nearest defense before and after the period', () => {
    const onJump = vi.fn();
    render(<EmptyPeriod state={{ view: 'week', date: '2026-09-22' }} dates={dates} onJump={onJump} />);
    expect(screen.getByRole('status').textContent).toContain('No defenses this week.');
    fireEvent.click(screen.getByRole('button', { name: 'Previous: Wed 16 Sep 2026' }));
    expect(onJump).toHaveBeenLastCalledWith('2026-09-16');
    fireEvent.click(screen.getByRole('button', { name: 'Next: Fri 2 Oct 2026' }));
    expect(onJump).toHaveBeenLastCalledWith('2026-10-02');
  });

  it('omits a direction with nothing in it', () => {
    render(<EmptyPeriod state={{ view: 'month', date: '2026-11-03' }} dates={dates} onJump={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous: Fri 2 Oct 2026' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Next/ })).toBeNull();
  });
});
