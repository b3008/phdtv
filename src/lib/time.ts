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
