/** Offset of `timeZone` from UTC, in minutes, at the given instant. */
export function zoneOffsetMinutes(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' }).formatToParts(at);
  const name = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
  const match = /^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/.exec(name);
  if (!match) throw new Error(`Unexpected offset format "${name}" for ${timeZone}`);
  const [, sign, hours, minutes] = match;
  if (!sign) return 0;
  const total = Number(hours) * 60 + Number(minutes ?? '0');
  return sign === '-' ? -total : total;
}

/** UTC offset in minutes written in an ISO 8601 string, or null when it has none. */
export function parseOffsetMinutes(iso: string): number | null {
  const match = /(Z|([+-])(\d{2}):(\d{2}))$/.exec(iso);
  if (!match) return null;
  if (match[1] === 'Z') return 0;
  const total = Number(match[3]) * 60 + Number(match[4]);
  return match[2] === '-' ? -total : total;
}

/** Calendar date (YYYY-MM-DD) of the instant in the given zone. */
export function localDateString(timeZone: string, at: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
}

export interface Scheduled {
  starts_at: string;
  timezone: string;
  duration_minutes?: number | undefined;
}

export const DEFAULT_DURATION_MINUTES = 90;

/** Start and end instants of a defense; the end defaults to 90 minutes after the start. */
export function defenseWindow(item: Scheduled): { start: Date; end: Date } {
  const start = new Date(item.starts_at);
  const minutes = item.duration_minutes ?? DEFAULT_DURATION_MINUTES;
  return { start, end: new Date(start.getTime() + minutes * 60_000) };
}

export type Phase = 'upcoming' | 'live' | 'past';

export function classify(item: Scheduled, now: Date): Phase {
  const { start, end } = defenseWindow(item);
  if (now < start) return 'upcoming';
  if (now < end) return 'live';
  return 'past';
}

/** e.g. "Tue 15 Sep 2026" in the given zone. Assembled from parts so the month is never spelled "Sept". */
export function formatDate(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('weekday')} ${get('day')} ${get('month')} ${get('year')}`;
}

/** e.g. "12:30" (24-hour clock) in the given zone. */
export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(
    new Date(iso),
  );
}

/**
 * e.g. "CEST" or "EDT". English locales disagree on which zones have names (en-US knows EDT, en-GB knows CEST),
 * so both are tried; when neither has one, the IANA name is returned rather than a bare "GMT+2".
 */
export function zoneAbbreviation(timeZone: string, at: Date): string {
  for (const locale of ['en-US', 'en-GB']) {
    const value = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'short' })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName')?.value;
    if (value && !/^(GMT|UTC)[+-]/.test(value)) return value;
  }
  return timeZone;
}
