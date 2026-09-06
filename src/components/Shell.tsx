import type { ReactNode } from 'react';
import { withBase } from '../lib/paths.ts';

interface ShellProps {
  /** Site base path, e.g. /phdtv/. */
  base?: string;
  /** Which navigation entry is the current page, if any. */
  current?: 'calendar' | 'about';
  children: ReactNode;
}

/**
 * Layout chrome shared by every page. The masthead band and the footer are full width with an inner column;
 * pages put their own content inside a <div className="column">.
 */
export function Shell({ base = '/', current, children }: ShellProps) {
  const home = withBase(base, '/');
  return (
    <div className="shell">
      <header className="masthead-band">
        <div className="column masthead">
          <a className="masthead-logo" href={home} aria-label="PhD TV">
            PhD TV
          </a>
          <nav className="masthead-nav" aria-label="Main">
            <a href={home} aria-current={current === 'calendar' ? 'page' : undefined}>
              Calendar
            </a>
            <a href={`${home}?view=year&recorded=1`}>Recordings</a>
            <a href={withBase(base, '/about/')} aria-current={current === 'about' ? 'page' : undefined}>
              About
            </a>
          </nav>
        </div>
      </header>
      <main className="shell-main">{children}</main>
      <footer className="shell-footer">
        <div className="column">
          <p>
            Public PhD defenses that are streamed for free. Listings come from university agendas and
            from people who submit them. <a href={withBase(base, '/about/')}>About this site</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
