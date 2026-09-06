// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DefenseCard } from '../../src/components/DefenseCard.tsx';
import { fixtureDefense } from '../fixtures/defenses.ts';

const NOW = new Date('2026-09-15T10:00:00Z');

describe('DefenseCard', () => {
  it('shows the stream link, the badge and the institution time for an upcoming defense', () => {
    render(<DefenseCard defense={fixtureDefense()} phase="upcoming" now={NOW} viewerZone={null} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Jane Doe' })).toBeTruthy();
    expect(screen.getByText('TU Delft')).toBeTruthy();
    expect(screen.getByText(/12:30/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Watch the livestream' })).toBeTruthy();
    expect(screen.queryByText('Live')).toBeNull();
  });

  it('marks a live defense and says when no stream link is known', () => {
    render(<DefenseCard defense={fixtureDefense({ stream: undefined })} phase="live" now={NOW} viewerZone={null} />);
    expect(screen.getByText('Live')).toBeTruthy();
    expect(screen.getByText('No stream link is known for this defense')).toBeTruthy();
  });

  it('shows recording status for a past defense', () => {
    const past = fixtureDefense({ startsAt: '2026-07-01T12:30:00+02:00', endsAt: '2026-07-01T11:30:00.000Z', recording: { url: 'https://youtu.be/rec', platform: 'youtube' } });
    render(<DefenseCard defense={past} phase="past" now={NOW} viewerZone={null} />);
    expect(screen.getByRole('link', { name: 'Watch the recording' }).getAttribute('href')).toBe('https://youtu.be/rec');
    expect(screen.queryByRole('link', { name: 'Watch the livestream' })).toBeNull();
  });
});
