import { describe, expect, it } from 'vitest';
import { parseOffsetMinutes, zoneOffsetMinutes } from '../../src/lib/time.ts';

describe('zoneOffsetMinutes', () => {
  it('returns the summer offset of a European zone', () => {
    expect(zoneOffsetMinutes('Europe/Amsterdam', new Date('2026-07-01T00:00:00Z'))).toBe(120);
  });
  it('returns the winter offset of a European zone', () => {
    expect(zoneOffsetMinutes('Europe/Amsterdam', new Date('2026-01-15T00:00:00Z'))).toBe(60);
  });
  it('returns zero for UTC', () => {
    expect(zoneOffsetMinutes('UTC', new Date('2026-07-01T00:00:00Z'))).toBe(0);
  });
  it('returns a negative offset west of Greenwich', () => {
    expect(zoneOffsetMinutes('America/New_York', new Date('2026-07-01T00:00:00Z'))).toBe(-240);
  });
  it('handles half-hour offsets', () => {
    expect(zoneOffsetMinutes('Asia/Kolkata', new Date('2026-07-01T00:00:00Z'))).toBe(330);
  });
});

describe('parseOffsetMinutes', () => {
  it('reads a positive offset', () => {
    expect(parseOffsetMinutes('2026-09-15T12:30:00+02:00')).toBe(120);
  });
  it('reads Z as zero', () => {
    expect(parseOffsetMinutes('2026-09-15T10:30:00Z')).toBe(0);
  });
  it('reads a negative half-hour offset', () => {
    expect(parseOffsetMinutes('2026-09-15T12:30:00-05:30')).toBe(-330);
  });
  it('returns null when there is no offset', () => {
    expect(parseOffsetMinutes('2026-09-15T12:30:00')).toBeNull();
  });
});
