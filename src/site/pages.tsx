// One function per page type: a data-bearing header around one component tree.
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { CenterfoldPage } from '../components/CenterfoldPage.tsx';
import { DefenseCalendar } from '../components/DefenseCalendar.tsx';
import { DefensePage } from '../components/DefensePage.tsx';
import type { MajorField } from '../components/MajorFieldLegend.tsx';
import { Shell } from '../components/Shell.tsx';
import type { Defense } from '../lib/defense.ts';
import { withBase } from '../lib/paths.ts';
import { pageAssets, type AssetManifest } from './assets.ts';
import { Document } from './document.tsx';
import { Island } from './islands.tsx';

export interface PageContext {
  /** Site base path, e.g. /phdtv/. */
  base: string;
  manifest: AssetManifest;
  /** Build time as ISO 8601; the first client render uses it so hydration matches the server markup. */
  renderedAt: string;
  /** Preview builds show labelled slots for editorial fields that are still empty; the deploy hides them. */
  preview?: boolean;
}

export interface HomeData {
  defenses: Defense[];
  majors: MajorField[];
}

/** A complete HTML document. React does not emit the doctype, so it is added here. */
export function renderDocument(element: ReactElement): string {
  return `<!doctype html>\n${renderToString(element)}\n`;
}

/** The home page: the calendar island renders everything below the masthead, headline strip included. */
export function homePage({ defenses, majors }: HomeData, { base, manifest, renderedAt }: PageContext): string {
  return renderDocument(
    <Document
      title="PhD TV"
      description="A calendar of PhD defenses that are livestreamed for free."
      base={base}
      assets={pageAssets(manifest, base, ['DefenseCalendar'])}
    >
      <Shell base={base} current="calendar">
        <Island name="DefenseCalendar" component={DefenseCalendar} props={{ defenses, majors, renderedAt }} />
      </Shell>
    </Document>,
  );
}

/** The old archive URL: a meta refresh to the calendar's year view with the recordings filter on. */
export function archiveRedirectPage({ base, manifest }: PageContext): string {
  const target = `${withBase(base, '/')}?view=year&recorded=1`;
  return renderDocument(
    <Document title="PhD TV: archive" base={base} assets={pageAssets(manifest, base, [])} refresh={target}>
      <Shell base={base}>
        <div className="column">
          <p className="redirect">
            The archive is now part of the calendar. <a href={target}>Continue to past defenses with recordings.</a>
          </p>
        </div>
      </Shell>
    </Document>,
  );
}

export function defensePage(defense: Defense, { base, manifest, renderedAt }: PageContext): string {
  return renderDocument(
    <Document
      title={`${defense.candidate}: ${defense.title}`}
      description={`PhD defense at ${defense.university.name}.`}
      base={base}
      assets={pageAssets(manifest, base, ['DefensePage'])}
    >
      <Shell base={base}>
        <div className="column">
          <Island name="DefensePage" component={DefensePage} props={{ defense, base, renderedAt }} />
        </div>
      </Shell>
    </Document>,
  );
}

/** The feature page of a defense that has a centerfold; its stylesheet rides on the island's manifest entry. */
export function centerfoldPage(defense: Defense, { base, manifest, renderedAt, preview = false }: PageContext): string {
  return renderDocument(
    <Document
      title={`Centerfold: ${defense.candidate}`}
      description={defense.centerfold?.standfirst ?? `PhD defense at ${defense.university.name}.`}
      base={base}
      assets={pageAssets(manifest, base, ['CenterfoldPage'])}
    >
      <Shell base={base}>
        <Island name="CenterfoldPage" component={CenterfoldPage} props={{ defense, base, renderedAt, preview }} />
      </Shell>
    </Document>,
  );
}
