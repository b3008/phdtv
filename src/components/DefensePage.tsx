import { institutionLabel, type Defense } from '../lib/defense.ts';
import { countryName, languageName, PLATFORM_LABELS } from '../lib/display.ts';
import { withBase } from '../lib/paths.ts';
import { classify, formatDate } from '../lib/time.ts';
import { RecordingStatus } from './RecordingStatus.tsx';
import { TimeLabel } from './TimeLabel.tsx';
import { useViewerClock } from './useViewerClock.ts';

interface DefensePageProps {
  defense: Defense;
  base?: string;
  renderedAt?: string;
}

function Attribution({ defense }: { defense: Defense }) {
  if (defense.source.url) {
    return (
      <p className="attribution">
        Listed from the <a href={defense.source.url}>{defense.university.name} agenda</a>.
      </p>
    );
  }
  const text = { submitted: 'Submitted to PhD TV by a visitor.', curated: 'Listed by the PhD TV curators.', scraped: 'Collected automatically.' }[
    defense.source.channel
  ];
  return <p className="attribution">{text}</p>;
}

/** Body of one defense's page. Hydrated so times can be shown in the viewer's zone. */
export function DefensePage({ defense, base = '/', renderedAt }: DefensePageProps) {
  const clock = useViewerClock();
  const now = clock.now ?? (renderedAt ? new Date(renderedAt) : new Date());
  const phase = classify({ starts_at: defense.startsAt, timezone: defense.timezone, duration_minutes: defense.durationMinutes }, now);
  const institution = defense.university.website ? (
    <a href={defense.university.website}>{defense.university.name}</a>
  ) : (
    defense.university.name
  );

  return (
    <article className={`defense defense-${phase}`}>
      <header className="defense-head">
        <p className="defense-kicker">
          <span className="badge-inst">{institutionLabel(defense)}</span>
          {phase === 'live' && <span className="pill-live">Live now</span>}
        </p>
        <p className="defense-candidate">{defense.candidate}</p>
        <h1 className="defense-title">{defense.title}</h1>
      </header>

      <dl className="defense-facts">
        <dt>Institution</dt>
        <dd>
          {institution}, <span>{countryName(defense.university.country)}</span>
        </dd>
        {defense.faculty && (
          <>
            <dt>Faculty</dt>
            <dd>{defense.faculty}</dd>
          </>
        )}
        {defense.disciplines.length > 0 && (
          <>
            <dt>Disciplines</dt>
            <dd>
              {defense.disciplines.map((d, i) => (
                <span key={d.slug}>
                  {i > 0 ? ', ' : ''}
                  <a href={`${withBase(base, '/')}?discipline=${encodeURIComponent(d.slug)}`}>{d.name}</a>
                </span>
              ))}
            </dd>
          </>
        )}
        {defense.language && (
          <>
            <dt>Language</dt>
            <dd>{languageName(defense.language)}</dd>
          </>
        )}
        <dt>When</dt>
        <dd>
          {formatDate(defense.startsAt, defense.timezone)},{' '}
          <TimeLabel startsAt={defense.startsAt} timezone={defense.timezone} viewerZone={clock.zone} />
          {` (${defense.durationMinutes} min)`}
        </dd>
      </dl>

      <p className="defense-actions">
        {phase !== 'past' && defense.stream && (
          <span className="action-group">
            <a className="action" href={defense.stream.url}>
              Watch the livestream
            </a>
            <span className="action-note"> on {PLATFORM_LABELS[defense.stream.platform]}</span>
          </span>
        )}
        {phase !== 'past' && !defense.stream && (
          <span className="status status-muted">
            {phase === 'live' ? 'No stream link is known for this defense' : 'Stream link not yet announced'}
          </span>
        )}
        {phase === 'past' && <RecordingStatus defense={defense} now={now} />}
        {phase !== 'past' && defense.recording && 'url' in defense.recording && (
          <a className="action" href={defense.recording.url}>
            Watch the recording
          </a>
        )}
        {defense.thesisUrl && (
          <a className="action action-secondary" href={defense.thesisUrl}>
            Read the thesis
          </a>
        )}
        {defense.source.url && (
          <a className="action action-secondary" href={defense.source.url}>
            University announcement
          </a>
        )}
      </p>

      {defense.abstract && (
        <section className="defense-abstract">
          <h2>About the thesis</h2>
          <p>{defense.abstract}</p>
        </section>
      )}

      <Attribution defense={defense} />
    </article>
  );
}
