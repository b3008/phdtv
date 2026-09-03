import { useEffect, useState } from 'react';

export interface ViewerClock {
  /** The viewer's current time; null until the component has mounted in a browser. */
  now: Date | null;
  /** The viewer's IANA time zone; null until mounted. */
  zone: string | null;
}

/**
 * Build-time and first-client renders see nulls, so server and client markup match.
 * After mount the real clock and zone take over, refreshed every minute.
 */
export function useViewerClock(): ViewerClock {
  const [clock, setClock] = useState<ViewerClock>({ now: null, zone: null });
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tick = () => setClock({ now: new Date(), zone });
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return clock;
}
