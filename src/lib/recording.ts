import { defenseWindow, type Scheduled } from './time.ts';

export type RecordingState = 'available' | 'none' | 'pending' | 'unknown';

export const RECORDING_PENDING_DAYS = 30;

export interface HasRecording extends Scheduled {
  recording?: { url: string; platform: string } | { status: 'none' } | undefined;
}

/** What to tell a viewer about the recording of a past defense. */
export function recordingState(item: HasRecording, now: Date): RecordingState {
  if (item.recording && 'url' in item.recording) return 'available';
  if (item.recording && 'status' in item.recording) return 'none';
  const { end } = defenseWindow(item);
  const daysSinceEnd = (now.getTime() - end.getTime()) / 86_400_000;
  return daysSinceEnd < RECORDING_PENDING_DAYS ? 'pending' : 'unknown';
}
