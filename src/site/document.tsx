import type { ReactNode } from 'react';
import { withBase } from '../lib/paths.ts';
import type { PageAssets } from './assets.ts';

interface DocumentProps {
  title: string;
  description?: string;
  base: string;
  assets: PageAssets;
  /** Target of a meta refresh, for redirect pages. */
  refresh?: string;
  children: ReactNode;
}

/** The HTML document around a page. Everything visible inside <body> is a component from src/components. */
export function Document({ title, description, base, assets, refresh, children }: DocumentProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        {refresh && <meta httpEquiv="refresh" content={`0; url=${refresh}`} />}
        {description && <meta name="description" content={description} />}
        <link rel="alternate" type="text/calendar" title="PhD TV: all defenses" href={withBase(base, '/feeds/all.ics')} />
        {assets.styles.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        {assets.preloads.map((href) => (
          <link key={href} rel="modulepreload" href={href} />
        ))}
      </head>
      <body>
        {children}
        {assets.scripts.map((src) => (
          <script key={src} type="module" src={src} />
        ))}
      </body>
    </html>
  );
}
