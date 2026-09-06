// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DayView } from '../../src/components/DayView.tsx';
import { fixtureDefense } from '../fixtures/defenses.ts';

const NOW = new Date('2026-09-15T10:00:00Z');
const first = fixtureDefense({ key: 'a', candidate: 'First Person', startsAt: '2026-09-15T09:00:00+02:00', endsAt: '2026-09-15T08:00:00.000Z' });
const second = fixtureDefense({ key: 'b', candidate: 'Second Person', startsAt: '2026-09-15T12:30:00+02:00', endsAt: '2026-09-15T11:30:00.000Z' });

describe('DayView', () => {
  it('heads with the date spelled out and lists the cards in order', () => {
    render(<DayView date="2026-09-15" defenses={[first, second]} now={NOW} zone={null} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Tuesday 15 September 2026' })).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['First Person', 'Second Person']);
  });

  it('gives each card the phase for the clock', () => {
    render(<DayView date="2026-09-15" defenses={[first, second]} now={NOW} zone={null} />);
    expect(screen.getByText('Recording not yet available')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Watch the livestream' })).toBeTruthy();
  });
});
