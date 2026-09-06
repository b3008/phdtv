import { useEffect, useState } from 'react';
import { DEFAULT_VIEW } from '../lib/calendar.ts';
import { calendarBackLink, tuneInAction, tuneInLine, whenLine, type BackLink } from '../lib/centerfold.ts';
import { defensePhase, institutionLabel, majorFieldName, type CenterfoldQuestion, type Defense, type DefenseCenterfold } from '../lib/defense.ts';
import { withBase } from '../lib/paths.ts';
import { useViewerClock } from './useViewerClock.ts';

interface CenterfoldPageProps {
  defense: Defense;
  /** Site base path, e.g. /phdtv/. */
  base?: string;
  /** Build time; the first client render uses it so hydration matches the server markup. */
  renderedAt?: string;
  /** Preview builds render a labelled slot for every empty editorial field; production hides the block instead. */
  preview?: boolean;
}

const DEFAULT_QUESTIONS = ['Why this topic?', 'What surprised you?', 'What happens after the defense?'];

/** A labelled placeholder for an editorial field that has not been written yet. Preview builds only. */
function Slot({ label, className }: { label: string; className?: string }) {
  return <div className={className ? `cf-slot ${className}` : 'cf-slot'}>{label}</div>;
}

/** Production shows only answered questions; a preview shows every question, or the standard three, with slots. */
function questionRows(centerfold: DefenseCenterfold, preview: boolean): CenterfoldQuestion[] {
  const written = centerfold.questions ?? [];
  if (!preview) return written.filter((q) => q.a);
  return written.length > 0 ? written : DEFAULT_QUESTIONS.map((q) => ({ q }));
}

/** Body of a defense's centerfold page. Hydrated so the phase, the times and the back link follow the viewer. */
export function CenterfoldPage({ defense, base = '/', renderedAt, preview = false }: CenterfoldPageProps) {
  const clock = useViewerClock();
  const now = clock.now ?? (renderedAt ? new Date(renderedAt) : new Date());
  const phase = defensePhase(defense, now);
  const home = withBase(base, '/');
  const [back, setBack] = useState<BackLink>({ view: DEFAULT_VIEW, href: home });
  useEffect(() => {
    setBack(calendarBackLink({ referrer: document.referrer, search: window.location.search, home, origin: window.location.origin }));
  }, [home]);

  const centerfold = defense.centerfold ?? {};
  const field = majorFieldName(defense);
  const questions = questionRows(centerfold, preview);
  const showMain = questions.length > 0 || Boolean(centerfold.quote) || preview;
  const action = tuneInAction(defense, phase, now);

  const portrait = centerfold.portrait ? (
    <img className="cf-portrait" src={centerfold.portrait} alt={`Portrait of ${defense.candidate}`} />
  ) : preview ? (
    <Slot label="Portrait of the candidate" className="cf-portrait" />
  ) : null;
  const wide = centerfold.wide ? <img className="cf-wide" src={centerfold.wide} alt="" /> : preview ? <Slot label="Lab, campus or work in progress" className="cf-wide" /> : null;
  const detail = centerfold.detail ? <img className="cf-detail" src={centerfold.detail} alt="" /> : preview ? <Slot label="Detail: a figure from the thesis" className="cf-detail" /> : null;

  return (
    <article className={`cf cf-${phase}`}>
      <p className="cf-back">
        <a href={back.href}>{`‹ Back to ${back.view} view`}</a>
      </p>
      <div className="cf-box">
        <div className="cf-topbar">
          <span>{centerfold.issue ? `Centerfold · ${centerfold.issue}` : 'Centerfold'}</span>
          <span className="cf-topbar-tags">
            <span className="cf-badge">{institutionLabel(defense)}</span>
            {phase === 'live' && <span className="cf-tag-live">Live now</span>}
          </span>
        </div>

        <div className="cf-hero">
          {portrait && <div className="cf-hero-media">{portrait}</div>}
          <div className="cf-hero-text">
            {centerfold.kicker ? <span className="cf-kicker">{centerfold.kicker}</span> : preview && <Slot label="Kicker" className="cf-kicker-slot" />}
            <h1 className="cf-name">{defense.candidate}</h1>
            <p className="cf-meta">{field ? `${defense.university.name} · ${field}` : defense.university.name}</p>
            {centerfold.standfirst ? (
              <p className="cf-standfirst">{centerfold.standfirst}</p>
            ) : (
              preview && <Slot label="Standfirst: one or two sentences of plain-language framing" className="cf-standfirst" />
            )}
          </div>
        </div>

        <div className="cf-thesis">
          <span className="cf-label">The thesis</span>
          <p className="cf-thesis-title">{`“${defense.title}”`}</p>
        </div>

        <div className="cf-body">
          {showMain && (
            <div className="cf-main">
              {questions.length > 0 && (
                <>
                  <h2 className="cf-heading">Three questions</h2>
                  <ol className="cf-qa">
                    {questions.map((item, i) => (
                      <li key={item.q} className="cf-q">
                        <span className="cf-q-num" aria-hidden="true">
                          {i + 1}
                        </span>
                        <div>
                          <p className="cf-q-text">{item.q}</p>
                          {item.a ? <p className="cf-q-answer">{item.a}</p> : <Slot label="Answer from the candidate" className="cf-q-answer" />}
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}
              {(centerfold.quote || preview) && (
                <blockquote className="cf-quote">
                  <span className="cf-label">In their words</span>
                  {centerfold.quote ? <p className="cf-quote-text">{`“${centerfold.quote}”`}</p> : <Slot label="Pull quote from the candidate" className="cf-quote-text" />}
                  <footer className="cf-quote-by">{`${defense.candidate}, ${institutionLabel(defense)}`}</footer>
                </blockquote>
              )}
            </div>
          )}
          <aside className="cf-side">
            {wide}
            <div className="cf-closeup">
              <div className="cf-closeup-head">Close-up</div>
              <dl className="cf-facts">
                <div className="cf-fact">
                  <dt>Institution</dt>
                  <dd>{defense.university.name}</dd>
                </div>
                {field && (
                  <div className="cf-fact">
                    <dt>Discipline</dt>
                    <dd>{field}</dd>
                  </div>
                )}
                {(centerfold.facts ?? []).map(([key, value]) => (
                  <div key={key} className="cf-fact">
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
                <div className="cf-fact">
                  <dt>When</dt>
                  <dd>{whenLine(defense, clock.zone)}</dd>
                </div>
              </dl>
            </div>
            {detail}
          </aside>
        </div>

        <div className="cf-tunein">
          <div>
            <span className="cf-label">Tune in</span>
            <span className="cf-tunein-line">{tuneInLine(defense, clock.zone)}</span>
          </div>
          <div className="cf-tunein-actions">
            {action.kind === 'link' ? (
              <a className="cf-button" href={action.href}>
                {action.text}
              </a>
            ) : (
              <span className="cf-tunein-note">{action.text}</span>
            )}
            <a className="cf-listing" href={defense.url}>
              Listing ›
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
