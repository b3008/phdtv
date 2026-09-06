// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DefenseCalendar } from '../../src/components/DefenseCalendar.tsx';
import { fixtureDefense, type DefenseOverrides } from '../fixtures/defenses.ts';

// The clock is Monday 7 September 2026, 13:20 in Amsterdam; the viewer sits in Amsterdam unless a test says otherwise.
process.env['TZ'] = 'Europe/Amsterdam';
const NOW = new Date('2026-09-07T11:20:00Z');
const RENDERED_AT = NOW.toISOString();
const MAJORS = [
  { slug: 'natural-sciences', name: 'Natural sciences' },
  { slug: 'engineering-and-technology', name: 'Engineering and technology' },
  { slug: 'agricultural-and-veterinary-sciences', name: 'Agricultural and veterinary sciences' },
  { slug: 'social-sciences', name: 'Social sciences' },
];

const at = (key: string, candidate: string, startsAt: string, extra: DefenseOverrides = {}) =>
  fixtureDefense({
    key,
    url: `/defenses/${key}/`,
    candidate,
    startsAt,
    endsAt: new Date(new Date(startsAt).getTime() + 3_600_000).toISOString(),
    timezone: 'Europe/Amsterdam',
    durationMinutes: 60,
    ...extra,
  });
const live = at('live', 'Live Person', '2026-09-07T13:00:00+02:00', {
  university: { slug: 'kth', name: 'KTH Royal Institute of Technology', shortName: 'KTH', country: 'SE' },
  disciplines: [{ slug: 'electrical-electronic-and-information-engineering', name: 'Electrical engineering', major: 'engineering-and-technology' }],
});
const wed = at('wed', 'Wed Person', '2026-09-09T09:00:00+02:00', { disciplines: [{ slug: 'law', name: 'Law', major: 'social-sciences' }] });
const midnight = at('midnight', 'Midnight Person', '2026-09-16T00:30:00+02:00');
const october = at('october', 'October Person', '2026-10-02T12:15:00+02:00');
const past = at('past', 'Past Person', '2026-07-01T11:00:00+02:00', { stream: undefined, recording: { url: 'https://youtu.be/rec', platform: 'youtube' } });
const ALL = [live, wed, midnight, october, past];

const renderCalendar = () => render(<DefenseCalendar defenses={ALL} majors={MAJORS} renderedAt={RENDERED_AT} />);
const period = () => document.querySelector('.toolbar-period')?.textContent;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: NOW });
  window.history.replaceState(null, '', '/');
});
afterEach(() => {
  vi.useRealTimers();
  process.env['TZ'] = 'Europe/Amsterdam';
});

describe('DefenseCalendar: month view on today', () => {
  it('opens in the month view with today outlined and the legend of present fields', () => {
    const { container } = renderCalendar();
    expect(period()).toBe('September 2026');
    expect(screen.getByRole('button', { name: 'Month', pressed: true })).toBeTruthy();
    expect(container.querySelector('.month-cell-today .month-num')?.textContent).toBe('7');
    const legend = within(screen.getByRole('list', { name: 'Major fields' })).getAllByRole('listitem');
    expect(legend.map((l) => l.textContent)).toEqual(['Natural sciences', 'Engineering and technology', 'Social sciences']);
  });

  it('heads the page with the headline strip and the intro', () => {
    renderCalendar();
    const items = within(screen.getByRole('list', { name: 'Headlines' })).getAllByRole('listitem');
    expect(items.map((i) => i.textContent)).toEqual([
      'On air nowLive Person defends at KTH!',
      'Coming up3 defenses you can still catch live',
      'Catch-up1 recording ready to watch',
    ]);
    expect(screen.getByRole('heading', { level: 1, name: 'PhD defenses you can watch live' })).toBeTruthy();
    expect(screen.getByText('Special issue')).toBeTruthy();
  });

  it('places chips on the viewer-local date as links to the defense pages', () => {
    renderCalendar();
    expect(screen.getByRole('link', { name: /Wed Person/ }).getAttribute('href')).toBe('/defenses/wed/');
    expect(screen.getByRole('link', { name: /Midnight Person/ }).closest('.month-cell')?.querySelector('.month-num')?.textContent).toBe('16');
    expect(screen.queryByRole('link', { name: /Past Person/ })).toBeNull();
  });

  it('surfaces the live defense above the toolbar with its stream link and the starburst', () => {
    renderCalendar();
    const strip = screen.getByRole('region', { name: 'Live now' });
    expect(within(strip).getByText('Live Person')).toBeTruthy();
    expect(within(strip).getByRole('link', { name: 'Watch the livestream' })).toBeTruthy();
    expect(strip.querySelector('.starburst')?.textContent).toBe('On air!');
  });
});

describe('DefenseCalendar: navigation and the URL', () => {
  it('switches views, keeps the anchor and writes the view to the URL', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: 'Week' }));
    expect(period()).toBe('7 – 13 Sep 2026');
    expect(screen.getByText('Now')).toBeTruthy();
    expect(window.location.search).toBe('?view=week');
    fireEvent.click(screen.getByRole('button', { name: 'Year' }));
    expect(period()).toBe('2026');
    expect(within(screen.getByRole('region', { name: 'September 2026' })).getByText('3 defenses')).toBeTruthy();
    expect(within(screen.getByRole('region', { name: 'July 2026' })).getByText('1 defense')).toBeTruthy();
  });

  it('moves with previous, next and Today, writing only a non-default date', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(period()).toBe('October 2026');
    expect(window.location.search).toBe('?date=2026-10-07');
    expect(screen.getByRole('link', { name: /October Person/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(period()).toBe('September 2026');
    expect(window.location.search).toBe('');
  });

  it('applies the filters to every view, including the year counts, but not to the headlines', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: 'Year' }));
    fireEvent.change(screen.getByLabelText('Discipline'), { target: { value: 'law' } });
    expect(within(screen.getByRole('region', { name: 'September 2026' })).getByText('1 defense')).toBeTruthy();
    expect(window.location.search).toBe('?discipline=law&view=year');
    expect(screen.getByText('3 defenses you can still catch live')).toBeTruthy();
  });

  it('offers jump links in an empty week and lands on the next defense', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: 'Week' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }));
    expect(period()).toBe('21 – 27 Sep 2026');
    expect(screen.getByRole('status').textContent).toContain('No defenses this week.');
    expect(screen.getByRole('button', { name: 'Previous: Wed 16 Sep 2026' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next: Fri 2 Oct 2026' }));
    expect(period()).toBe('28 Sep – 4 Oct 2026');
    expect(screen.getByRole('link', { name: /October Person/ })).toBeTruthy();
    expect(window.location.search).toBe('?view=week&date=2026-10-02');
  });

  it('reads the view, the date and the filters from the URL', () => {
    window.history.replaceState(null, '', '/?view=day&date=2026-07-01');
    renderCalendar();
    expect(screen.getByRole('heading', { level: 2, name: 'Wednesday 1 July 2026' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Watch the recording' })).toBeTruthy();
    expect(window.location.search).toBe('?view=day&date=2026-07-01');
  });

  it('opens a day from the year view', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: 'Year' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wed 9 Sep 2026, 1 defense' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Wednesday 9 September 2026' })).toBeTruthy();
    expect(window.location.search).toBe('?view=day&date=2026-09-09');
  });
});

describe('DefenseCalendar: build-time markup and hydration', () => {
  it('renders the build month with institution-local dates and hydrates without mismatch', () => {
    const html = renderToString(<DefenseCalendar defenses={ALL} majors={MAJORS} renderedAt={RENDERED_AT} />);
    expect(html).toContain('September 2026');
    expect(html).toContain('Special issue');
    expect(html).toContain('Midnight Person');
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<DefenseCalendar defenses={ALL} majors={MAJORS} renderedAt={RENDERED_AT} />, { container, hydrate: true });
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([]);
    errors.mockRestore();
    expect(within(container).getByRole('link', { name: /Midnight Person/ }).closest('.month-cell')?.querySelector('.month-num')?.textContent).toBe('16');
  });

  it('regroups a midnight defense onto the viewer-local date after mount', () => {
    process.env['TZ'] = 'America/New_York';
    renderCalendar();
    expect(screen.getByRole('link', { name: /Midnight Person/ }).closest('.month-cell')?.querySelector('.month-num')?.textContent).toBe('15');
    expect(screen.getByText('18:30')).toBeTruthy();
  });
});
