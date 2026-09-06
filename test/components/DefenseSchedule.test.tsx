// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DefenseSchedule } from '../../src/components/DefenseSchedule.tsx';
import { fixtureDefense, startingAt, type DefenseOverrides } from '../fixtures/defenses.ts';

const NOW = new Date('2026-09-15T10:00:00Z');

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: NOW });
  window.history.replaceState(null, '', '/');
});
afterEach(() => {
  vi.useRealTimers();
});

const soon = startingAt(NOW, 60, { key: 'soon', candidate: 'Soon Person', disciplines: [{ slug: 'law', name: 'Law', major: 'social-sciences' }] });
const tomorrow = startingAt(NOW, 60 * 26, {
  key: 'tomorrow',
  candidate: 'Tomorrow Person',
  university: { slug: 'uu', name: 'Utrecht University', country: 'NL' },
  stream: undefined,
});
const gone = startingAt(NOW, -180, { key: 'gone', candidate: 'Past Person' });

describe('DefenseSchedule: upcoming view', () => {
  it('lists only future defenses, soonest first, grouped by day', () => {
    render(<DefenseSchedule mode="upcoming" defenses={[tomorrow, gone, soon]} />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(['Tue 15 Sep 2026', 'Wed 16 Sep 2026']);
    const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(['Soon Person', 'Tomorrow Person']);
    expect(screen.queryByText('Past Person')).toBeNull();
  });

  it('shows an explicit empty state', () => {
    render(<DefenseSchedule mode="upcoming" defenses={[gone]} />);
    expect(screen.getByText('No upcoming defenses are listed yet.')).toBeTruthy();
  });

  it('shows a stream link or says it is not announced yet', () => {
    render(<DefenseSchedule mode="upcoming" defenses={[soon, tomorrow]} />);
    expect(screen.getByRole('link', { name: 'Watch the livestream' })).toBeTruthy();
    expect(screen.getByText('Stream link not yet announced')).toBeTruthy();
  });

  it('filters by discipline and writes the filter to the URL', () => {
    render(<DefenseSchedule mode="upcoming" defenses={[soon, tomorrow]} />);
    fireEvent.change(screen.getByLabelText('Discipline'), { target: { value: 'law' } });
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Soon Person']);
    expect(window.location.search).toBe('?discipline=law');
  });

  it('filters by institution and reads an initial filter from the URL', () => {
    window.history.replaceState(null, '', '/?university=uu');
    render(<DefenseSchedule mode="upcoming" defenses={[soon, tomorrow]} />);
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Tomorrow Person']);
    fireEvent.change(screen.getByLabelText('Institution'), { target: { value: '' } });
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    expect(window.location.search).toBe('');
  });
});

describe('DefenseSchedule: live now', () => {
  const live = startingAt(NOW, -30, { key: 'live', candidate: 'Live Person' });
  const liveNoStream = startingAt(NOW, -20, { key: 'live2', candidate: 'Quiet Person', stream: undefined });

  it('surfaces defenses in progress above the upcoming list with their stream link', () => {
    render(<DefenseSchedule mode="upcoming" defenses={[soon, live, liveNoStream]} />);
    const liveSection = screen.getByRole('region', { name: 'Live now' });
    expect(within(liveSection).getByText('Live Person')).toBeTruthy();
    expect(within(liveSection).getByRole('link', { name: 'Watch the livestream' })).toBeTruthy();
    expect(within(liveSection).getByText('No stream link is known for this defense')).toBeTruthy();
    expect(within(liveSection).queryByText('Soon Person')).toBeNull();
  });

  it('renders institution-local time and zone at build time and hydrates without mismatch', () => {
    const defenses = [fixtureDefense({ key: 'fixed', candidate: 'Fixed Person', startsAt: '2026-09-16T12:30:00+02:00', endsAt: '2026-09-16T11:30:00.000Z' })];
    const html = renderToString(<DefenseSchedule mode="upcoming" defenses={defenses} />);
    expect(html).toContain('12:30');
    expect(html).toContain('CEST');
    expect(html).toContain('Europe/Amsterdam');

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<DefenseSchedule mode="upcoming" defenses={defenses} />, { container, hydrate: true });
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([]);
    errors.mockRestore();
    expect(within(container).getByText('Fixed Person')).toBeTruthy();
  });

  it('shows viewer-local time alongside institution time after mount', () => {
    process.env['TZ'] = 'America/New_York';
    const defenses = [fixtureDefense({ startsAt: '2026-09-16T12:30:00+02:00', endsAt: '2026-09-16T11:30:00.000Z' })];
    render(<DefenseSchedule mode="upcoming" defenses={defenses} />);
    expect(screen.getByText(/06:30/)).toBeTruthy();
    expect(screen.getByText(/12:30/)).toBeTruthy();
  });
});

describe('DefenseSchedule: archive view', () => {
  const NOW_ARCHIVE = new Date('2026-09-03T00:00:00Z');
  const past = (key: string, candidate: string, startsAt: string, extra: DefenseOverrides = {}) =>
    fixtureDefense({ key, candidate, startsAt, endsAt: new Date(new Date(startsAt).getTime() + 3_600_000).toISOString(), ...extra });
  const available = past('avail', 'Available Person', '2026-07-01T12:30:00+02:00', { recording: { url: 'https://youtu.be/rec', platform: 'youtube' } });
  const none = past('none', 'Unrecorded Person', '2026-07-02T12:30:00+02:00', { recording: { status: 'none' } });
  const pending = past('pending', 'Pending Person', '2026-08-20T12:30:00+02:00');
  const unknown = past('unknown', 'Unknown Person', '2026-06-01T12:30:00+02:00');
  const future = startingAt(NOW_ARCHIVE, 60, { key: 'future', candidate: 'Future Person' });

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'], now: NOW_ARCHIVE });
  });

  it('lists past defenses most recent first with one recording state each', () => {
    render(<DefenseSchedule mode="archive" defenses={[unknown, available, future, pending, none]} />);
    const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(['Pending Person', 'Unrecorded Person', 'Available Person', 'Unknown Person']);
    expect(screen.getByRole('link', { name: 'Watch the recording' }).getAttribute('href')).toBe('https://youtu.be/rec');
    expect(screen.getByText('This defense was not recorded')).toBeTruthy();
    expect(screen.getByText('Recording not yet available')).toBeTruthy();
    expect(screen.getByText('No recording known')).toBeTruthy();
  });

  it('offers a recordings-only filter reflected in the URL', () => {
    render(<DefenseSchedule mode="archive" defenses={[available, none, pending, unknown]} />);
    fireEvent.click(screen.getByLabelText('Only defenses with a recording'));
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Available Person']);
    expect(window.location.search).toBe('?recorded=1');
  });
});
