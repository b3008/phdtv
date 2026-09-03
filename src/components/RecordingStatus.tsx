import type { Defense } from '../lib/defense.ts';
import { PLATFORM_LABELS } from '../lib/display.ts';
import { recordingState } from '../lib/recording.ts';

export function RecordingStatus({ defense, now }: { defense: Defense; now: Date }) {
  const state = recordingState({ starts_at: defense.startsAt, timezone: defense.timezone, duration_minutes: defense.durationMinutes, recording: defense.recording }, now);
  if (state === 'available' && defense.recording && 'url' in defense.recording) {
    return (
      <span className="action-group">
        <a className="action" href={defense.recording.url}>
          Watch the recording
        </a>
        <span className="action-note"> on {PLATFORM_LABELS[defense.recording.platform]}</span>
      </span>
    );
  }
  const text = { none: 'This defense was not recorded', pending: 'Recording not yet available', unknown: 'No recording known', available: '' }[state];
  return <span className="status status-muted">{text}</span>;
}
