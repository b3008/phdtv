import type { Filters } from '../lib/filters.ts';

interface Option {
  slug: string;
  name: string;
}

interface FilterBarProps {
  filters: Filters;
  disciplines: Option[];
  universities: Option[];
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, disciplines, universities, onChange }: FilterBarProps) {
  const set = (patch: Partial<Filters>) => {
    const next: Filters = { ...filters, ...patch };
    if (!next.discipline) delete next.discipline;
    if (!next.university) delete next.university;
    if (!next.recordedOnly) delete next.recordedOnly;
    onChange(next);
  };
  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()}>
      <label>
        <span className="label">Discipline</span>
        <select value={filters.discipline ?? ''} onChange={(e) => set({ discipline: e.target.value })}>
          <option value="">All disciplines</option>
          {disciplines.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="label">Institution</span>
        <select value={filters.university ?? ''} onChange={(e) => set({ university: e.target.value })}>
          <option value="">All institutions</option>
          {universities.map((u) => (
            <option key={u.slug} value={u.slug}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
      <label className="filters-check">
        <input type="checkbox" checked={filters.recordedOnly ?? false} onChange={(e) => set({ recordedOnly: e.target.checked })} />
        Only defenses with a recording
      </label>
    </form>
  );
}
