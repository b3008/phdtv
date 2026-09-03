import type { APIRoute, GetStaticPaths } from 'astro';
import { disciplineSlugs, renderFeed } from '../../lib/feed-data.ts';

export const getStaticPaths: GetStaticPaths = async () => (await disciplineSlugs()).map((discipline) => ({ params: { discipline } }));

export const GET: APIRoute = ({ site, params }) => {
  const slug = params['discipline'] ?? '';
  return renderFeed(site, `PhD TV: ${slug}`, (d) => d.disciplines.some((x) => x.slug === slug));
};
