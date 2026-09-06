// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { headlines, HeadlineStrip } from '../../src/components/HeadlineStrip.tsx';
import { fixtureDefense, type DefenseOverrides } from '../fixtures/defenses.ts';

const NOW = new Date('2026-09-07T11:20:00Z');
const at = (key: string, candidate: string, startsAt: string, extra: DefenseOverrides = {}) =>
  fixtureDefense({ key, candidate, startsAt, endsAt: new Date(new Date(startsAt).getTime() + 3_600_000).toISOString(), timezone: 'Europe/Amsterdam', durationMinutes: 60, ...extra });
const live = at('live', 'Live Person', '2026-09-07T13:00:00+02:00', { university: { slug: 'kth', name: 'KTH Royal Institute of Technology', shortName: 'KTH', country: 'SE' } });
const wed = at('wed', 'Wed Person', '2026-09-09T09:00:00+02:00');
const october = at('october', 'October Person', '2026-10-02T12:15:00+02:00');
const past = at('past', 'Past Person', '2026-07-01T11:00:00+02:00', { recording: { url: 'https://youtu.be/rec', platform: 'youtube' } });

describe('headlines', () => {
  it('leads with the defense on air, then counts what is still to come and what can be caught up', () => {
    expect(headlines([live, wed, october, past], NOW, 'Europe/Amsterdam')).toEqual([
      { kind: 'live', kicker: 'On air now', text: 'Live Person defends at KTH!' },
      { kind: 'upcoming', kicker: 'Coming up', text: '2 defenses you can still catch live' },
      { kind: 'recordings', kicker: 'Catch-up', text: '1 recording ready to watch' },
    ]);
  });

  it('names the next defense when nothing is on air, with singular counts', () => {
    expect(headlines([wed, past], NOW, 'Europe/Amsterdam')[0]).toEqual({ kind: 'live', kicker: 'Next up', text: 'Wed Person at TU Delft on Wed 9 Sep 2026' });
    expect(headlines([wed, past], NOW, 'Europe/Amsterdam')[1]?.text).toBe('1 defense you can still catch live');
  });

  it('copes with an empty dataset', () => {
    expect(headlines([], NOW, null).map((h) => h.text)).toEqual(['No defenses scheduled yet', '0 defenses you can still catch live', '0 recordings ready to watch']);
  });
});

describe('HeadlineStrip', () => {
  it('renders the three headlines as a list with one class per kind', () => {
    render(<HeadlineStrip headlines={headlines([live, wed, past], NOW, 'Europe/Amsterdam')} />);
    const items = within(screen.getByRole('list', { name: 'Headlines' })).getAllByRole('listitem');
    expect(items.map((i) => i.className)).toEqual(['headline headline-live', 'headline headline-upcoming', 'headline headline-recordings']);
    expect(items[0]?.textContent).toBe('On air nowLive Person defends at KTH!');
  });
});
