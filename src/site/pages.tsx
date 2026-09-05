// One function per page type. Each is a data-bearing header around one component tree, as the Astro pages were.
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { DefensePage } from '../components/DefensePage.tsx';
import { DefenseSchedule } from '../components/DefenseSchedule.tsx';
import { PageIntro } from '../components/PageIntro.tsx';
import { Shell } from '../components/Shell.tsx';
import type { Defense } from '../lib/defense.ts';
import { pageAssets, type AssetManifest } from './assets.ts';
import { Document } from './document.tsx';
import { Island } from './islands.tsx';

export interface PageContext {
  /** Site base path, e.g. /phdtv/. */
  base: string;
  manifest: AssetManifest;
  /** Build time as ISO 8601; the first client render uses it so hydration matches the server markup. */
  renderedAt: string;
}

/** A complete HTML document. React does not emit the doctype, so it is added here. */
export function renderDocument(element: ReactElement): string {
  return `<!doctype html>\n${renderToString(element)}\n`;
}

export function homePage(defenses: Defense[], { base, manifest, renderedAt }: PageContext): string {
  return renderDocument(
    <Document
      title="PhD TV"
      description="A calendar of PhD defenses that are livestreamed for free."
      base={base}
      assets={pageAssets(manifest, base, ['DefenseSchedule'])}
    >
      <Shell base={base}>
        <PageIntro
          title="PhD defenses you can watch live"
          lede="Public defenses streamed for free by universities, shown in your local time. Subscribe to the calendar feed to get them in your own calendar."
        />
        <Island name="DefenseSchedule" component={DefenseSchedule} props={{ mode: 'upcoming' as const, defenses, renderedAt }} />
      </Shell>
    </Document>,
  );
}

export function archivePage(defenses: Defense[], { base, manifest, renderedAt }: PageContext): string {
  return renderDocument(
    <Document
      title="PhD TV: archive"
      description="Past PhD defenses, with recordings where they exist."
      base={base}
      assets={pageAssets(manifest, base, ['DefenseSchedule'])}
    >
      <Shell base={base}>
        <PageIntro
          title="Past defenses"
          lede="Recordings where a university published one. Where none exists, we say so rather than showing a dead link."
        />
        <Island name="DefenseSchedule" component={DefenseSchedule} props={{ mode: 'archive' as const, defenses, renderedAt }} />
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
        <Island name="DefensePage" component={DefensePage} props={{ defense, base, renderedAt }} />
      </Shell>
    </Document>,
  );
}
