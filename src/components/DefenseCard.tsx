import { institutionLabel, type Defense } from '../lib/defense.ts';
import type { Phase } from '../lib/time.ts';
import { fieldClass } from './DefenseChip.tsx';
import { RecordingStatus } from './RecordingStatus.tsx';
import { TimeLabel } from './TimeLabel.tsx';

interface DefenseCardProps {
  defense: Defense;
  phase: Phase;
  now: Date;
  viewerZone: string | null;
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

/** Full card for the day view and the live strip: past defenses show recording status, others the stream. */
export function DefenseCard({ defense, phase, now, viewerZone }: DefenseCardProps) {
  return (
    <article className={`card card-${phase} ${fieldClass(defense)}`}>
      <div className="card-body">
        <div className="card-head">
          <span className="card-time">
            <TimeLabel startsAt={defense.startsAt} timezone={defense.timezone} viewerZone={viewerZone} />
          </span>
          <span className="badge-inst">{institutionLabel(defense)}</span>
          {phase === 'live' && <span className="pill-live">Live</span>}
        </div>
        <h3 className="card-candidate">
          <a href={defense.url}>{defense.candidate}</a>
        </h3>
        <p className="card-title">{defense.title}</p>
        <p className="card-meta">
          {defense.university.name}
          {defense.faculty ? ` · ${defense.faculty}` : ''}
          {defense.disciplines.length > 0 ? ` · ${defense.disciplines.map((d) => d.name).join(', ')}` : ''}
        </p>
        <p className="card-action">
          {phase === 'past' ? <RecordingStatus defense={defense} now={now} /> : <StreamStatus defense={defense} phase={phase} />}
        </p>
      </div>
    </article>
  );
}
