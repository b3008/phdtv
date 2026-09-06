import { institutionLabel, majorField, type Defense } from '../lib/defense.ts';
import { formatTime, zoneAbbreviation, type Phase } from '../lib/time.ts';

interface DefenseChipProps {
  defense: Defense;
  phase: Phase;
  /** Viewer zone once known; the institution zone is used until then. */
  zone: string | null;
  /** Week chips carry the institution badge; month chips are shorter. */
  detail: 'week' | 'month';
}

/** CSS class that sets the --field colour from the first discipline's major field. */
export function fieldClass(defense: Defense): string {
  const major = majorField(defense);
  return major ? `field-${major}` : 'field-none';
}

/** Title, institution, institution-local time and disciplines, for the chip's tooltip. */
export function chipTooltip(defense: Defense): string {
  const at = new Date(defense.startsAt);
  const parts = [defense.title, defense.university.name, `${formatTime(defense.startsAt, defense.timezone)} ${zoneAbbreviation(defense.timezone, at)}`];
  if (defense.disciplines.length > 0) parts.push(defense.disciplines.map((d) => d.name).join(', '));
  return parts.join(' · ');
}

/** Compact link to a defense page for the week and month grids. */
export function DefenseChip({ defense, phase, zone, detail }: DefenseChipProps) {
  return (
    <a className={`chip chip-${detail} chip-${phase} ${fieldClass(defense)}`} href={defense.url} title={chipTooltip(defense)}>
      <span className="chip-head">
        <span className="chip-time">{formatTime(defense.startsAt, zone ?? defense.timezone)}</span>
        {detail === 'week' && <span className="badge-inst">{institutionLabel(defense)}</span>}
        {detail === 'month' && phase === 'live' && <span className="pill-live">Live</span>}
      </span>
      <span className="chip-name">{defense.candidate}</span>
      {detail === 'week' && phase === 'live' && (
        <span className="chip-foot">
          <span className="pill-live">Live</span>
        </span>
      )}
    </a>
  );
}
