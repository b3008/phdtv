import { formatDate, formatTime, zoneAbbreviation } from '../lib/time.ts';

interface TimeLabelProps {
  startsAt: string;
  timezone: string;
  /** Viewer zone once known; the viewer's time is added when it differs from the institution's. */
  viewerZone: string | null;
  withDate?: boolean;
}

/** Institution-local time (always) plus viewer-local time (after mount, when different). */
export function TimeLabel({ startsAt, timezone, viewerZone, withDate = false }: TimeLabelProps) {
  const at = new Date(startsAt);
  const showViewer = viewerZone !== null && viewerZone !== timezone;
  return (
    <span className="time">
      <time dateTime={startsAt}>
        {withDate ? `${formatDate(startsAt, timezone)}, ` : ''}
        {formatTime(startsAt, timezone)} <abbr title={timezone}>{zoneAbbreviation(timezone, at)}</abbr>
      </time>
      {showViewer && (
        <span className="time-viewer">
          {' '}
          · {formatTime(startsAt, viewerZone)} <abbr title={viewerZone}>{zoneAbbreviation(viewerZone, at)}</abbr> your time
        </span>
      )}
    </span>
  );
}
