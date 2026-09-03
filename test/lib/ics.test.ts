import ICAL from 'ical.js';
import { describe, expect, it } from 'vitest';
import { escapeText, foldLine, formatUtc, renderCalendar, type IcsEvent } from '../../src/lib/ics.ts';

const event: IcsEvent = {
  uid: '2026/2026-09-15-tudelft-jane-doe@phdtv',
  start: new Date('2026-09-15T12:30:00+02:00'),
  durationMinutes: 60,
  summary: 'Jane Doe: Learning, scheduling; and uncertainty',
  description: 'Stream: https://example.org/live\nInstitution time: 12:30 CEST',
  location: 'Delft University of Technology',
  url: 'https://example.org/defenses/2026/2026-09-15-tudelft-jane-doe/',
  sequence: 3,
  stamp: new Date('2026-09-01T06:00:00Z'),
};

describe('escapeText', () => {
  it('escapes backslash, semicolon, comma and newline', () => {
    expect(escapeText('a, b; c\\ d\nnew')).toBe('a\\, b\\; c\\\\ d\\nnew');
  });
});

describe('foldLine', () => {
  const unfold = (s: string) => s.replace(/\r\n /g, '');
  it('keeps every physical line within 75 octets and restores on unfolding', () => {
    const long = `DESCRIPTION:${'x'.repeat(200)}`;
    const folded = foldLine(long);
    for (const physical of folded.split('\r\n')) expect(Buffer.byteLength(physical, 'utf8')).toBeLessThanOrEqual(75);
    expect(folded.split('\r\n').slice(1).every((l) => l.startsWith(' '))).toBe(true);
    expect(unfold(folded)).toBe(long);
  });
  it('never splits a multi-byte character', () => {
    const long = `SUMMARY:${'é'.repeat(120)}`;
    const folded = foldLine(long);
    for (const physical of folded.split('\r\n')) expect(Buffer.byteLength(physical, 'utf8')).toBeLessThanOrEqual(75);
    expect(unfold(folded)).toBe(long);
  });
  it('leaves short lines alone', () => {
    expect(foldLine('VERSION:2.0')).toBe('VERSION:2.0');
  });
});

describe('formatUtc', () => {
  it('renders the instant in UTC basic format', () => {
    expect(formatUtc(new Date('2026-09-15T12:30:00+02:00'))).toBe('20260915T103000Z');
  });
});

describe('renderCalendar', () => {
  const text = renderCalendar([event], { name: 'PhD TV' });

  it('uses CRLF line endings and the required envelope', () => {
    expect(text.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(text.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(text).not.toMatch(/[^\r]\n/);
    expect(text).toContain('X-WR-CALNAME:PhD TV\r\n');
  });

  it('writes the event fields', () => {
    expect(text).toContain('UID:2026/2026-09-15-tudelft-jane-doe@phdtv\r\n');
    expect(text).toContain('DTSTART:20260915T103000Z\r\n');
    expect(text).toContain('DURATION:PT60M\r\n');
    expect(text).toContain('DTSTAMP:20260901T060000Z\r\n');
    expect(text).toContain('SEQUENCE:3\r\n');
    expect(text).toContain('URL:https://example.org/defenses/2026/2026-09-15-tudelft-jane-doe/\r\n');
  });

  it('round-trips through an iCalendar parser', () => {
    const component = new ICAL.Component(ICAL.parse(text));
    const vevent = new ICAL.Event(component.getFirstSubcomponent('vevent')!);
    expect(vevent.summary).toBe(event.summary);
    expect(vevent.description).toBe(event.description);
    expect(vevent.location).toBe(event.location);
    expect(vevent.startDate.toJSDate().toISOString()).toBe('2026-09-15T10:30:00.000Z');
    expect(vevent.endDate.toJSDate().toISOString()).toBe('2026-09-15T11:30:00.000Z');
    expect(vevent.sequence).toBe(3);
  });
});
