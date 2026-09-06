import { describe, expect, it } from 'vitest';
import { calendarBackLink, tuneInAction, tuneInLine, whenLine } from '../../src/lib/centerfold.ts';
import { fixtureDefense } from '../fixtures/defenses.ts';

describe('calendarBackLink', () => {
  const origin = 'https://phdtv.net';

  it('returns to the calendar view the visitor came from, keeping its query', () => {
    const referrer = 'https://phdtv.net/?view=week&date=2026-09-07&discipline=law';
    expect(calendarBackLink({ referrer, search: '', home: '/', origin })).toEqual({ view: 'week', href: referrer });
  });

  it('reads the month view from a bare calendar referrer', () => {
    expect(calendarBackLink({ referrer: 'https://phdtv.net/', search: '', home: '/', origin })).toEqual({ view: 'month', href: 'https://phdtv.net/' });
  });

  it('falls back to the from parameter when the referrer is not the calendar', () => {
    const referrer = 'https://phdtv.net/defenses/2026/2026-09-07-kth-anders-enqvist/';
    expect(calendarBackLink({ referrer, search: '?from=day', home: '/', origin })).toEqual({ view: 'day', href: '/?view=day' });
  });

  it('ignores a referrer from another origin', () => {
    expect(calendarBackLink({ referrer: 'https://example.org/?view=day', search: '', home: '/', origin })).toEqual({ view: 'month', href: '/' });
  });

  it('falls back to the month view for an unknown from parameter', () => {
    expect(calendarBackLink({ referrer: '', search: '?from=bogus', home: '/', origin })).toEqual({ view: 'month', href: '/' });
  });

  it('respects the site base', () => {
    expect(calendarBackLink({ referrer: 'https://x.test/phdtv/?view=year', search: '', home: '/phdtv/', origin: 'https://x.test' })).toEqual({
      view: 'year',
      href: 'https://x.test/phdtv/?view=year',
    });
    expect(calendarBackLink({ referrer: '', search: '?from=week', home: '/phdtv/', origin: 'https://x.test' })).toEqual({ view: 'week', href: '/phdtv/?view=week' });
  });
});

describe('tuneInLine', () => {
  const defense = fixtureDefense();

  it('shows the institution date and time before the viewer zone is known', () => {
    expect(tuneInLine(defense, null)).toBe('Tue 15 Sep 2026 · 12:30 CEST');
  });

  it('shows the viewer date and time once known', () => {
    expect(tuneInLine(defense, 'America/New_York')).toBe('Tue 15 Sep 2026 · 06:30 EDT');
  });
});

describe('whenLine', () => {
  const defense = fixtureDefense();

  it('spells the institution date out before the viewer zone is known', () => {
    expect(whenLine(defense, null)).toBe('Tuesday 15 September 2026, 12:30 CEST');
  });

  it('adds the institution time in brackets when the viewer zone differs', () => {
    expect(whenLine(defense, 'America/New_York')).toBe('Tuesday 15 September 2026, 06:30 EDT (12:30 CEST local)');
  });

  it('adds nothing when the viewer is in the institution zone', () => {
    expect(whenLine(defense, 'Europe/Amsterdam')).toBe('Tuesday 15 September 2026, 12:30 CEST');
  });
});

describe('tuneInAction', () => {
  const now = new Date('2026-09-15T10:00:00Z');

  it('links to the livestream before and during the defense', () => {
    const defense = fixtureDefense();
    expect(tuneInAction(defense, 'upcoming', now)).toEqual({ kind: 'link', href: 'https://collegerama.tudelft.nl/live/1', text: 'Watch the livestream' });
    expect(tuneInAction(defense, 'live', now)).toEqual({ kind: 'link', href: 'https://collegerama.tudelft.nl/live/1', text: 'Watch the livestream' });
  });

  it('says the stream link is not yet announced when there is none', () => {
    expect(tuneInAction(fixtureDefense({ stream: undefined }), 'upcoming', now)).toEqual({ kind: 'text', text: 'Stream link not yet announced' });
  });

  it('links to the recording, naming YouTube or Vimeo, after the defense', () => {
    const onYouTube = fixtureDefense({ recording: { url: 'https://youtu.be/rec', platform: 'youtube' } });
    expect(tuneInAction(onYouTube, 'past', now)).toEqual({ kind: 'link', href: 'https://youtu.be/rec', text: 'Watch the recording on YouTube' });
    const elsewhere = fixtureDefense({ recording: { url: 'https://media.example/rec', platform: 'university' } });
    expect(tuneInAction(elsewhere, 'past', now)).toEqual({ kind: 'link', href: 'https://media.example/rec', text: 'Watch the recording' });
  });

  it('describes the recording state after the defense when there is no link', () => {
    const later = new Date('2026-12-01T10:00:00Z');
    expect(tuneInAction(fixtureDefense(), 'past', later)).toEqual({ kind: 'text', text: 'No recording known' });
    expect(tuneInAction(fixtureDefense(), 'past', new Date('2026-09-16T10:00:00Z'))).toEqual({ kind: 'text', text: 'Recording not yet available' });
    expect(tuneInAction(fixtureDefense({ recording: { status: 'none' } }), 'past', later)).toEqual({ kind: 'text', text: 'This defense was not recorded' });
  });
});
