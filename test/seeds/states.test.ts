import { describe, expect, it } from 'vitest';
import { loadRecordFiles } from '../../src/lib/records.ts';
import { recordingState } from '../../src/lib/recording.ts';
import { classify } from '../../src/lib/time.ts';
import { recordSchema } from '../../src/schema/record.ts';

/**
 * The seed set must exercise every state the site renders. Evaluated as of the day the seeds were
 * curated so the assertion stays deterministic as the calendar moves on.
 */
const AS_OF = new Date('2026-09-03T12:00:00Z');

const records = loadRecordFiles('.').map((file) => {
  const parsed = recordSchema.safeParse(file.data);
  if (!parsed.success) throw new Error(`${file.path} is invalid`);
  return { path: file.path, record: parsed.data };
});

const published = records.filter((r) => r.record.status === 'published');
const phase = (r: (typeof records)[number]) => classify(r.record, AS_OF);
const recording = (r: (typeof records)[number]) => recordingState(r.record, AS_OF);

describe('seed records', () => {
  it('has at least ten published records', () => {
    expect(published.length).toBeGreaterThanOrEqual(10);
  });
  it('include an upcoming defense with a stream link', () => {
    expect(published.some((r) => phase(r) === 'upcoming' && r.record.stream)).toBe(true);
  });
  it('include an upcoming defense without a stream link yet', () => {
    expect(published.some((r) => phase(r) === 'upcoming' && !r.record.stream)).toBe(true);
  });
  it('include a past defense with a recording', () => {
    expect(published.some((r) => phase(r) === 'past' && recording(r) === 'available')).toBe(true);
  });
  it('include a past defense known not to be recorded', () => {
    expect(published.some((r) => phase(r) === 'past' && recording(r) === 'none')).toBe(true);
  });
  it('include a recent past defense whose recording is still pending', () => {
    expect(published.some((r) => phase(r) === 'past' && recording(r) === 'pending')).toBe(true);
  });
  it('include an older past defense with no recording known', () => {
    expect(published.some((r) => phase(r) === 'past' && recording(r) === 'unknown')).toBe(true);
  });
});
