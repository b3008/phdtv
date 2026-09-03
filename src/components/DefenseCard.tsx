import type { Defense } from '../lib/defense.ts';
import type { Phase } from '../lib/time.ts';
import { RecordingStatus } from './RecordingStatus.tsx';
import { TimeLabel } from './TimeLabel.tsx';

interface DefenseCardProps {
  defense: Defense;
  phase: Phase;
  now: Date;
  viewerZone: string | null;
  mode: 'upcoming' | 'archive';
}

function StreamStatus({ defense, phase }: { defense: Defense; phase: Phase }) {
  if (defense.stream) {
    return (
      <a className="action" href={defense.stream.url}>
        Watch the livestream
      </a>
    );
  }
  return (
    <span className="status status-muted">
      {phase === 'live' ? 'No stream link is known for this defense' : 'Stream link not yet announced'}
    </span>
  );
}

export function DefenseCard({ defense, phase, now, viewerZone, mode }: DefenseCardProps) {
  return (
    <article className={`card card-${phase}`}>
      <div className="card-head">
        <h3 className="card-candidate">
          <a href={defense.url}>{defense.candidate}</a>
        </h3>
        {phase === 'live' && <span className="badge-live">Live now</span>}
      </div>
      <p className="card-title">{defense.title}</p>
      <p className="card-meta">
        {defense.university.name}
        {defense.faculty ? ` · ${defense.faculty}` : ''}
        {defense.disciplines.length > 0 ? ` · ${defense.disciplines.map((d) => d.name).join(', ')}` : ''}
      </p>
      <p className="card-time">
        <TimeLabel startsAt={defense.startsAt} timezone={defense.timezone} viewerZone={viewerZone} withDate={mode === 'archive'} />
      </p>
      <p className="card-action">
        {mode === 'archive' ? <RecordingStatus defense={defense} now={now} /> : <StreamStatus defense={defense} phase={phase} />}
      </p>
    </article>
  );
}
