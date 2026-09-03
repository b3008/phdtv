// Minimal RFC 5545 serialiser: enough for a public feed of events, fully under our control.

export interface IcsEvent {
  uid: string;
  start: Date;
  durationMinutes: number;
  summary: string;
  description?: string | undefined;
  location?: string | undefined;
  url?: string | undefined;
  /** Must increase whenever the event changes, so subscribers update in place. */
  sequence: number;
  /** When this version of the event was produced. */
  stamp: Date;
}

export interface CalendarOptions {
  name: string;
  prodId?: string;
}

const CRLF = '\r\n';
const MAX_OCTETS = 75;
const encoder = new TextEncoder();
const octets = (s: string) => encoder.encode(s).length;

/** Escape a TEXT value: backslash, semicolon, comma and newline. */
export function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold a content line at 75 octets; continuation lines begin with a space and never split a character. */
export function foldLine(line: string): string {
  if (octets(line) <= MAX_OCTETS) return line;
  const physical: string[] = [];
  let current = '';
  let used = 0;
  for (const ch of line) {
    const size = octets(ch);
    const limit = physical.length === 0 ? MAX_OCTETS : MAX_OCTETS - 1;
    if (used + size > limit) {
      physical.push(current);
      current = ch;
      used = size;
    } else {
      current += ch;
      used += size;
    }
  }
  physical.push(current);
  return physical.map((l, i) => (i === 0 ? l : ` ${l}`)).join(CRLF);
}

/** UTC instant in basic format, e.g. 20260915T103000Z. */
export function formatUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function formatDuration(minutes: number): string {
  return `PT${Math.max(0, Math.round(minutes))}M`;
}

function eventLines(event: IcsEvent): string[] {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${formatUtc(event.stamp)}`,
    `DTSTART:${formatUtc(event.start)}`,
    `DURATION:${formatDuration(event.durationMinutes)}`,
    `SEQUENCE:${event.sequence}`,
    `SUMMARY:${escapeText(event.summary)}`,
  ];
  if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
  if (event.url) lines.push(`URL:${event.url}`);
  lines.push('END:VEVENT');
  return lines;
}

/** A complete VCALENDAR document with CRLF line endings. */
export function renderCalendar(events: IcsEvent[], options: CalendarOptions): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${options.prodId ?? '-//PhD TV//phdtv//EN'}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(options.name)}`,
    ...events.flatMap(eventLines),
    'END:VCALENDAR',
  ];
  return `${lines.map(foldLine).join(CRLF)}${CRLF}`;
}
