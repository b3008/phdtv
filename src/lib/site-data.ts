import { getCollection } from 'astro:content';
import { toDefense, type Defense } from './defense.ts';

/** Every published defense as a view model, soonest first. Fails the build on a dangling institution reference. */
export async function loadPublishedDefenses(base: string): Promise<Defense[]> {
  const [records, universities, disciplines] = await Promise.all([
    getCollection('records'),
    getCollection('universities'),
    getCollection('disciplines'),
  ]);
  const universityById = new Map(universities.map((u) => [u.id, u.data]));
  const disciplineNames = Object.fromEntries(disciplines.map((d) => [d.data.slug, d.data.name]));
  return records
    .filter((r) => r.data.status === 'published')
    .map((r) => {
      const university = universityById.get(r.data.university);
      if (!university) throw new Error(`${r.id}: university "${r.data.university}" is not in the registry`);
      return toDefense({ id: r.id, body: r.body ?? '', record: r.data, university, disciplineNames, base });
    })
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
