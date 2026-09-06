import type { Defense } from '../../src/lib/defense.ts';

/** Overrides may set a field to undefined to remove it from the fixture. */
export type DefenseOverrides = { [K in keyof Defense]?: Defense[K] | undefined };

const withoutUndefined = (obj: Record<string, unknown>): Defense =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as unknown as Defense;

/** A published upcoming defense with every optional field; override what a test needs. */
export function fixtureDefense(overrides: DefenseOverrides = {}): Defense {
  return withoutUndefined({
    key: '2026/2026-09-15-tudelft-jane-doe',
    url: '/defenses/2026/2026-09-15-tudelft-jane-doe/',
    candidate: 'Jane Doe',
    title: 'Learning to schedule under uncertainty',
    university: { slug: 'tudelft', name: 'Delft University of Technology', shortName: 'TU Delft', country: 'NL', website: 'https://www.tudelft.nl/' },
    faculty: 'Electrical Engineering, Mathematics and Computer Science',
    disciplines: [{ slug: 'computer-and-information-sciences', name: 'Computer and information sciences', major: 'natural-sciences', majorName: 'Natural sciences' }],
    language: 'en',
    startsAt: '2026-09-15T12:30:00+02:00',
    endsAt: '2026-09-15T11:30:00.000Z',
    timezone: 'Europe/Amsterdam',
    durationMinutes: 60,
    stream: { url: 'https://collegerama.tudelft.nl/live/1', platform: 'university' },
    thesisUrl: 'https://repository.tudelft.nl/record/1',
    status: 'published',
    source: { channel: 'scraped', url: 'https://www.tudelft.nl/en/events/2026/phd-defence-jane-doe' },
    abstract: 'We study scheduling when the future is unknown.',
    ...overrides,
  });
}

/** Shift a fixture so that it starts `minutesFromNow` minutes from the given instant, keeping its zone. */
export function startingAt(now: Date, minutesFromNow: number, overrides: DefenseOverrides = {}): Defense {
  const start = new Date(now.getTime() + minutesFromNow * 60_000);
  const duration = overrides.durationMinutes ?? 60;
  const end = new Date(start.getTime() + duration * 60_000);
  return fixtureDefense({ startsAt: start.toISOString(), endsAt: end.toISOString(), timezone: 'UTC', durationMinutes: duration, ...overrides });
}
