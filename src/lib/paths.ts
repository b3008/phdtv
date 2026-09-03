/** Join the site base path (Astro's `import.meta.env.BASE_URL`) with a site-relative path. */
export function withBase(base: string, path: string): string {
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const trimmedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}
