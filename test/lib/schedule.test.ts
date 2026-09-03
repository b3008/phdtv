import { describe, expect, it } from 'vitest';
import { classify, defenseWindow, formatDate, formatTime, zoneAbbreviation } from '../../src/lib/time.ts';
import { recordingState } from '../../src/lib/recording.ts';

const at = (iso: string) => new Date(iso);
const base = { starts_at: '2026-09-15T12:30:00+02:00', timezone: 'Europe/Amsterdam' };

describe('defenseWindow', () => {
  it('defaults to 90 minutes', () => {
    const { start, end } = defenseWindow(base);
    expect(start.toISOString()).toBe('2026-09-15T10:30:00.000Z');
    expect(end.toISOString()).toBe('2026-09-15T12:00:00.000Z');
  });
  it('uses duration_minutes when set', () => {
    expect(defenseWindow({ ...base, duration_minutes: 60 }).end.toISOString()).toBe('2026-09-15T11:30:00.000Z');
  });
});

describe('classify', () => {
  it('is upcoming before the start', () => {
    expect(classify(base, at('2026-09-15T10:29:59Z'))).toBe('upcoming');
  });
  it('is live from the start until the end of the window', () => {
    expect(classify(base, at('2026-09-15T10:30:00Z'))).toBe('live');
    expect(classify(base, at('2026-09-15T11:59:00Z'))).toBe('live');
  });
  it('is past once the window has ended', () => {
    expect(classify(base, at('2026-09-15T12:00:00Z'))).toBe('past');
    expect(classify({ ...base, duration_minutes: 60 }, at('2026-09-15T11:31:00Z'))).toBe('past');
  });
  it('stays live across the end of daylight-saving time', () => {
    // 02:30 CEST on 2026-10-25 is 00:30Z; clocks go back at 01:00Z, so 02:15 CET (01:15Z) is inside a 120-minute window.
    const spanning = { starts_at: '2026-10-25T02:30:00+02:00', timezone: 'Europe/Amsterdam', duration_minutes: 120 };
    expect(classify(spanning, at('2026-10-25T02:15:00+01:00'))).toBe('live');
  });
});

describe('formatting in a zone', () => {
  it('formats institution-local date and time', () => {
    expect(formatDate(base.starts_at, base.timezone)).toBe('Tue 15 Sep 2026');
    expect(formatTime(base.starts_at, base.timezone)).toBe('12:30');
  });
  it('formats the same instant in another zone', () => {
    expect(formatTime(base.starts_at, 'America/New_York')).toBe('06:30');
    expect(formatDate('2026-09-15T00:30:00+02:00', 'America/New_York')).toBe('Mon 14 Sep 2026');
  });
  it('gives zone abbreviations on both sides of a daylight-saving change', () => {
    expect(zoneAbbreviation('Europe/Amsterdam', at('2026-10-24T12:30:00+02:00'))).toBe('CEST');
    expect(zoneAbbreviation('Europe/Amsterdam', at('2026-10-25T12:30:00+01:00'))).toBe('CET');
    expect(zoneAbbreviation('America/New_York', at('2026-09-15T10:30:00Z'))).toBe('EDT');
  });
});

describe('recordingState', () => {
  const past = { ...base, starts_at: '2026-07-01T12:30:00+02:00' }; // window ends 2026-07-01T12:00:00Z
  it('is available when a recording url exists', () => {
    expect(recordingState({ ...past, recording: { url: 'https://youtu.be/x', platform: 'youtube' } }, at('2026-09-03T00:00:00Z'))).toBe('available');
  });
  it('is none when the record says there is no recording', () => {
    expect(recordingState({ ...past, recording: { status: 'none' } }, at('2026-09-03T00:00:00Z'))).toBe('none');
  });
  it('is pending for 30 days after the defense ended', () => {
    expect(recordingState(past, at('2026-07-31T11:59:00Z'))).toBe('pending');
  });
  it('is unknown from 30 days after the end', () => {
    expect(recordingState(past, at('2026-07-31T12:00:00Z'))).toBe('unknown');
    expect(recordingState(past, at('2026-09-03T00:00:00Z'))).toBe('unknown');
  });
});
