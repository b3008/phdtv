import { describe, expect, it } from 'vitest';
import { feedEvents } from '../../src/lib/feed.ts';
import { fixtureDefense } from '../fixtures/defenses.ts';

const NOW = new Date('2026-09-03T12:00:00Z');
const site = 'https://example.test';
const histories = new Map([['records/2026/2026-09-15-tudelft-jane-doe.md', { commits: 3, lastCommitAt: new Date('2026-09-01T06:00:00Z') }]]);

describe('feedEvents', () => {
  it('maps a defense to an event with uid, times, summary, description, location and absolute url', () => {
    const [event] = feedEvents([fixtureDefense({ url: '/phdtv/defenses/2026/2026-09-15-tudelft-jane-doe/' })], { histories, now: NOW, site });
    expect(event?.uid).toBe('2026/2026-09-15-tudelft-jane-doe@phdtv');
    expect(event?.start.toISOString()).toBe('2026-09-15T10:30:00.000Z');
    expect(event?.durationMinutes).toBe(60);
    expect(event?.summary).toBe('Jane Doe: Learning to schedule under uncertainty');
    expect(event?.description).toContain('Stream: https://collegerama.tudelft.nl/live/1');
    expect(event?.description).toContain('12:30 CEST');
    expect(event?.location).toBe('Delft University of Technology');
    expect(event?.url).toBe('https://example.test/phdtv/defenses/2026/2026-09-15-tudelft-jane-doe/');
    expect(event?.sequence).toBe(3);
    expect(event?.stamp.toISOString()).toBe('2026-09-01T06:00:00.000Z');
  });

  it('falls back to sequence 0 and the build time for a record with no git history', () => {
    const [event] = feedEvents([fixtureDefense({ key: '2026/2026-09-16-new' })], { histories, now: NOW, site });
    expect(event?.sequence).toBe(0);
    expect(event?.stamp).toEqual(NOW);
  });

  it('keeps upcoming defenses and ones that ended within 30 days, drops older ones', () => {
    const recent = fixtureDefense({ key: 'recent', startsAt: '2026-08-20T12:00:00+02:00', endsAt: '2026-08-20T11:00:00.000Z' });
    const old = fixtureDefense({ key: 'old', startsAt: '2026-07-01T12:00:00+02:00', endsAt: '2026-07-01T11:00:00.000Z' });
    const keys = feedEvents([recent, old, fixtureDefense()], { histories, now: NOW, site }).map((e) => e.uid);
    expect(keys).toEqual(['recent@phdtv', '2026/2026-09-15-tudelft-jane-doe@phdtv']);
  });

  it('mentions the recording when there is one and says when no stream link is known', () => {
    const recorded = fixtureDefense({ stream: undefined, recording: { url: 'https://youtu.be/rec', platform: 'youtube' } });
    const [event] = feedEvents([recorded], { histories, now: NOW, site });
    expect(event?.description).toContain('Stream link not yet announced');
    expect(event?.description).toContain('Recording: https://youtu.be/rec');
  });
});
