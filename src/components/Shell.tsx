import type { ReactNode } from 'react';
import { withBase } from '../lib/paths.ts';

interface ShellProps {
  /** Site base path, e.g. /phdtv/. */
  base?: string;
  children: ReactNode;
}

/** Layout chrome shared by every page: header with navigation, main content, footer. */
export function Shell({ base = '/', children }: ShellProps) {
  return (
    <div className="shell">
      <header className="shell-header">
        <a className="shell-brand" href={withBase(base, '/')}>
          PhD TV
        </a>
        <nav className="shell-nav" aria-label="Main">
          <a href={withBase(base, '/')}>Upcoming</a>
          <a href={withBase(base, '/archive/')}>Archive</a>
          <a href={withBase(base, '/about/')}>About</a>
        </nav>
      </header>
      <main className="shell-main">{children}</main>
      <footer className="shell-footer">
        <p>
          Public PhD defenses that are streamed for free. Listings come from university agendas and
          from people who submit them. <a href={withBase(base, '/about/')}>About this site</a>.
        </p>
      </footer>
    </div>
  );
}
