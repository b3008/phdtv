import type { Defense } from './defense.ts';

export interface Filters {
  discipline?: string;
  university?: string;
  recordedOnly?: boolean;
}

export function applyFilters(defenses: Defense[], filters: Filters): Defense[] {
  return defenses.filter(
    (d) =>
      (!filters.discipline || d.disciplines.some((x) => x.slug === filters.discipline)) &&
      (!filters.university || d.university.slug === filters.university) &&
      (!filters.recordedOnly || (d.recording !== undefined && 'url' in d.recording)),
  );
}

export function searchFromFilters(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.discipline) params.set('discipline', filters.discipline);
  if (filters.university) params.set('university', filters.university);
  if (filters.recordedOnly) params.set('recorded', '1');
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function filtersFromSearch(search: string): Filters {
  const params = new URLSearchParams(search);
  const filters: Filters = {};
  const discipline = params.get('discipline');
  const university = params.get('university');
  if (discipline) filters.discipline = discipline;
  if (university) filters.university = university;
  if (params.get('recorded') === '1') filters.recordedOnly = true;
  return filters;
}
