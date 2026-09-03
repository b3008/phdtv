import type { APIRoute } from 'astro';
import { renderFeed } from '../../lib/feed-data.ts';

export const GET: APIRoute = ({ site }) => renderFeed(site, 'PhD TV: all defenses', () => true);
