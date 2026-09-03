import type { APIRoute } from 'astro';
import { loadPublishedDefenses } from '../../lib/site-data.ts';

export const SCHEMA_VERSION = 1;

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('astro.config site must be set to build absolute page URLs');
  const defenses = (await loadPublishedDefenses(import.meta.env.BASE_URL)).map((d) => ({ ...d, url: new URL(d.url, site).href }));
  const body = { schemaVersion: SCHEMA_VERSION, generatedAt: new Date().toISOString(), defenses };
  return new Response(`${JSON.stringify(body, null, 2)}\n`, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
