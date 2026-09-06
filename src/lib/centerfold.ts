// Pure helpers behind the centerfold page: where its back link goes and what its tune-in bar says.
import { DEFAULT_VIEW, formatDateLong, isCalendarView, type CalendarView } from './calendar.ts';
import type { Defense } from './defense.ts';
import { PLATFORM_LABELS } from './display.ts';
import { RECORDING_STATE_TEXT, recordingState } from './recording.ts';
import { formatDate, formatTime, localDateString, zoneAbbreviation, type Phase } from './time.ts';

export interface BackLink {
  view: CalendarView;
  /** Either the referring calendar URL itself or the home page with the view set. */
  href: string;
}

function calendarReferrer(referrer: string, home: string, origin: string): BackLink | undefined {
  if (!referrer) return undefined;
  let url: URL;
  try {
    url = new URL(referrer);
  } catch {
    return undefined;
  }
  if (url.origin !== origin || url.pathname !== home) return undefined;
  const view = url.searchParams.get('view') ?? '';
  return { view: isCalendarView(view) ? view : DEFAULT_VIEW, href: referrer };
}

/**
 * The calendar view to go back to: the calendar page the visitor came from (its view read from the referrer's
 * query, filters and date kept), else the view named by this page's `from` parameter, else the month view.
 */
export function calendarBackLink({ referrer, search, home, origin }: { referrer: string; search: string; home: string; origin: string }): BackLink {
  const fromReferrer = calendarReferrer(referrer, home, origin);
  if (fromReferrer) return fromReferrer;
  const from = new URLSearchParams(search).get('from') ?? '';
  if (isCalendarView(from)) return { view: from, href: from === DEFAULT_VIEW ? home : `${home}?view=${from}` };
  return { view: DEFAULT_VIEW, href: home };
}

/** e.g. "Tue 15 Sep 2026 · 12:30 CEST", in the viewer's zone once known and the institution's until then. */
export function tuneInLine(defense: Defense, zone: string | null): string {
  const z = zone ?? defense.timezone;
  const at = new Date(defense.startsAt);
  return `${formatDate(defense.startsAt, z)} · ${formatTime(defense.startsAt, z)} ${zoneAbbreviation(z, at)}`;
}

/** e.g. "Tuesday 15 September 2026, 06:30 EDT (12:30 CEST local)"; the bracket appears only when the zones differ. */
export function whenLine(defense: Defense, zone: string | null): string {
  const z = zone ?? defense.timezone;
  const at = new Date(defense.startsAt);
  const line = `${formatDateLong(localDateString(z, at))}, ${formatTime(defense.startsAt, z)} ${zoneAbbreviation(z, at)}`;
  if (zone === null || zone === defense.timezone) return line;
  return `${line} (${formatTime(defense.startsAt, defense.timezone)} ${zoneAbbreviation(defense.timezone, at)} local)`;
}

export type TuneInAction = { kind: 'link'; href: string; text: string } | { kind: 'text'; text: string };

/** The tune-in bar's action: the stream before and during the defense, the recording or its status afterwards. */
export function tuneInAction(defense: Defense, phase: Phase, now: Date): TuneInAction {
  if (phase !== 'past') {
    if (defense.stream) return { kind: 'link', href: defense.stream.url, text: 'Watch the livestream' };
    return { kind: 'text', text: 'Stream link not yet announced' };
  }
  const state = recordingState(
    { starts_at: defense.startsAt, timezone: defense.timezone, duration_minutes: defense.durationMinutes, recording: defense.recording },
    now,
  );
  if (state === 'available' && defense.recording && 'url' in defense.recording) {
    const { platform, url } = defense.recording;
    const suffix = platform === 'youtube' || platform === 'vimeo' ? ` on ${PLATFORM_LABELS[platform]}` : '';
    return { kind: 'link', href: url, text: `Watch the recording${suffix}` };
  }
  return { kind: 'text', text: RECORDING_STATE_TEXT[state] };
}
