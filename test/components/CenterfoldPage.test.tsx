// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CenterfoldPage } from '../../src/components/CenterfoldPage.tsx';
import type { DefenseCenterfold } from '../../src/lib/defense.ts';
import { fixtureDefense } from '../fixtures/defenses.ts';

const centerfold: DefenseCenterfold = {
  issue: 'No. 37',
  kicker: "This week's centerfold",
  standfirst: 'Every phone call costs energy somewhere in the network.',
  portrait: '/img/centerfold/jane-doe/portrait.jpg',
  wide: '/img/centerfold/jane-doe/lab.jpg',
  quote: 'How little can a wireless link get away with?',
  questions: [{ q: 'Why this topic?', a: 'Because it matters.' }, { q: 'What surprised you?' }],
  facts: [['Format', 'Public defense, livestreamed']],
};

const featured = (overrides: Parameters<typeof fixtureDefense>[0] = {}) =>
  fixtureDefense({ centerfold, centerfoldUrl: '/centerfold/2026/2026-09-15-tudelft-jane-doe/', ...overrides });

const RENDERED_AT = '2026-09-15T08:00:00.000Z';

// The viewer clock reads the process zone after mount; pin it to the institution's so the times below are stable.
process.env['TZ'] = 'Europe/Amsterdam';

function factRow(key: string): HTMLElement {
  const term = screen.getByText(key, { selector: 'dt' });
  const row = term.parentElement;
  if (!row) throw new Error(`no row for ${key}`);
  return row;
}

// After mount the page follows the real clock, so pin it to the build time unless a test moves it.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: new Date(RENDERED_AT) });
});

afterEach(() => {
  vi.useRealTimers();
  process.env['TZ'] = 'Europe/Amsterdam';
  Object.defineProperty(document, 'referrer', { value: '', configurable: true });
});

describe('CenterfoldPage', () => {
  it('shows the fields derived from the defense', () => {
    render(<CenterfoldPage defense={featured()} renderedAt={RENDERED_AT} />);
    expect(screen.getByText('Centerfold · No. 37')).toBeTruthy();
    expect(screen.getByText('TU Delft', { selector: '.cf-topbar *' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'Jane Doe' })).toBeTruthy();
    expect(screen.getByText('Delft University of Technology · Natural sciences')).toBeTruthy();
    expect(screen.getByText('“Learning to schedule under uncertainty”')).toBeTruthy();
    expect(within(factRow('Institution')).getByText('Delft University of Technology')).toBeTruthy();
    expect(within(factRow('Discipline')).getByText('Natural sciences')).toBeTruthy();
    expect(within(factRow('Format')).getByText('Public defense, livestreamed')).toBeTruthy();
    expect(within(factRow('When')).getByText('Tuesday 15 September 2026, 12:30 CEST')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Listing ›' }).getAttribute('href')).toBe('/defenses/2026/2026-09-15-tudelft-jane-doe/');
  });

  it('orders the close-up rows: institution, discipline, editorial facts, then when', () => {
    render(<CenterfoldPage defense={featured()} renderedAt={RENDERED_AT} />);
    const keys = screen.getAllByRole('term').map((t) => t.textContent);
    expect(keys).toEqual(['Institution', 'Discipline', 'Format', 'When']);
  });

  it('shows the editorial fields', () => {
    render(<CenterfoldPage defense={featured()} renderedAt={RENDERED_AT} />);
    expect(screen.getByText("This week's centerfold")).toBeTruthy();
    expect(screen.getByText('Every phone call costs energy somewhere in the network.')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Portrait of Jane Doe' }).getAttribute('src')).toBe('/img/centerfold/jane-doe/portrait.jpg');
    expect(screen.getByRole('heading', { level: 2, name: 'Three questions' })).toBeTruthy();
    expect(screen.getByText('Why this topic?')).toBeTruthy();
    expect(screen.getByText('Because it matters.')).toBeTruthy();
    expect(screen.getByText('“How little can a wireless link get away with?”')).toBeTruthy();
    expect(screen.getByText('Jane Doe, TU Delft')).toBeTruthy();
  });

  it('hides unanswered questions and empty editorial blocks in production', () => {
    const { container, rerender } = render(<CenterfoldPage defense={featured()} renderedAt={RENDERED_AT} />);
    expect(screen.queryByText('What surprised you?')).toBeNull();
    expect(container.querySelector('.cf-slot')).toBeNull();

    rerender(<CenterfoldPage defense={featured({ centerfold: {} })} renderedAt={RENDERED_AT} />);
    expect(screen.getByText('Centerfold')).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 2, name: 'Three questions' })).toBeNull();
    expect(screen.queryByText('In their words')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.cf-slot')).toBeNull();
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual(['Institution', 'Discipline', 'When']);
  });

  it('renders a labelled slot for every empty editorial field on a preview build', () => {
    render(<CenterfoldPage defense={featured({ centerfold: {} })} renderedAt={RENDERED_AT} preview />);
    const slots = screen.getAllByText(/./, { selector: '.cf-slot' }).map((s) => s.textContent);
    expect(slots).toEqual([
      'Portrait of the candidate',
      'Kicker',
      'Standfirst: one or two sentences of plain-language framing',
      'Answer from the candidate',
      'Answer from the candidate',
      'Answer from the candidate',
      'Pull quote from the candidate',
      'Lab, campus or work in progress',
      'Detail: a figure from the thesis',
    ]);
    expect(screen.getByText('Why this topic?')).toBeTruthy();
    expect(screen.getByText('What happens after the defense?')).toBeTruthy();
  });

  it('keeps a written answer and slots only the missing one on a preview build', () => {
    render(<CenterfoldPage defense={featured()} renderedAt={RENDERED_AT} preview />);
    expect(screen.getByText('Because it matters.')).toBeTruthy();
    expect(screen.getByText('What surprised you?')).toBeTruthy();
    expect(screen.getAllByText('Answer from the candidate')).toHaveLength(1);
    expect(screen.getByText('Detail: a figure from the thesis')).toBeTruthy();
  });

  it('offers the livestream with the institution date and time before the defense', () => {
    const { container } = render(<CenterfoldPage defense={featured()} renderedAt={RENDERED_AT} />);
    expect(screen.getByText('Tue 15 Sep 2026 · 12:30 CEST')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Watch the livestream' }).getAttribute('href')).toBe('https://collegerama.tudelft.nl/live/1');
    expect(screen.queryByText('Live now')).toBeNull();
    expect(container.querySelector('article')?.className).toBe('cf cf-upcoming');
  });

  it('marks a defense in progress', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-09-15T10:45:00Z') });
    const { container } = render(<CenterfoldPage defense={featured()} renderedAt="2026-09-15T10:45:00.000Z" />);
    expect(screen.getByText('Live now').className).toBe('cf-tag-live');
    expect(container.querySelector('article')?.className).toBe('cf cf-live');
    expect(screen.getByRole('link', { name: 'Watch the livestream' })).toBeTruthy();
  });

  it('offers the recording after the defense', () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-12-01T10:00:00Z') });
    const past = featured({ recording: { url: 'https://youtu.be/rec', platform: 'youtube' } });
    const { container } = render(<CenterfoldPage defense={past} renderedAt="2026-12-01T10:00:00.000Z" />);
    expect(screen.getByRole('link', { name: 'Watch the recording on YouTube' }).getAttribute('href')).toBe('https://youtu.be/rec');
    expect(container.querySelector('article')?.className).toBe('cf cf-past');
  });

  it('says so when there is nothing to watch', () => {
    render(<CenterfoldPage defense={featured({ stream: undefined })} renderedAt={RENDERED_AT} />);
    expect(screen.getByText('Stream link not yet announced')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Watch/ })).toBeNull();
  });

  it('shows the viewer time once mounted, with the institution time alongside', () => {
    process.env['TZ'] = 'America/New_York';
    render(<CenterfoldPage defense={featured()} renderedAt={RENDERED_AT} />);
    expect(screen.getByText('Tue 15 Sep 2026 · 06:30 EDT')).toBeTruthy();
    expect(within(factRow('When')).getByText('Tuesday 15 September 2026, 06:30 EDT (12:30 CEST local)')).toBeTruthy();
  });

  it('links back to the month view at build time and to the referring calendar view after mount', () => {
    const html = renderToString(<CenterfoldPage defense={featured()} base="/phdtv/" renderedAt={RENDERED_AT} />);
    expect(html).toContain('href="/phdtv/">‹ Back to month view</a>');

    const referrer = `${window.location.origin}/phdtv/?view=week&amp;date=2026-09-14`.replace('&amp;', '&');
    Object.defineProperty(document, 'referrer', { value: referrer, configurable: true });
    render(<CenterfoldPage defense={featured()} base="/phdtv/" renderedAt={RENDERED_AT} />);
    expect(screen.getByRole('link', { name: '‹ Back to week view' }).getAttribute('href')).toBe(referrer);
  });
});
