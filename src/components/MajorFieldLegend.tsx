export interface MajorField {
  slug: string;
  name: string;
}

/** One coloured square per major field; the colour comes from the field-<slug> class. */
export function MajorFieldLegend({ majors }: { majors: MajorField[] }) {
  if (majors.length === 0) return null;
  return (
    <ul className="legend" aria-label="Major fields">
      {majors.map((m) => (
        <li key={m.slug} className={`field-${m.slug}`}>
          <span className="legend-swatch" aria-hidden="true" />
          {m.name}
        </li>
      ))}
    </ul>
  );
}
