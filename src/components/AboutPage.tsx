import { withBase } from '../lib/paths.ts';
import type { University } from '../schema/university.ts';
import { PageIntro } from './PageIntro.tsx';

const REPOSITORY = 'https://github.com/b3008/phdtv';
const MAINTAINER = { name: 'Nikolaos Batalas', profile: 'https://github.com/b3008', email: 'nikolaos.batalas@gmail.com' };

interface AboutPageProps {
  /** Every institution of the registry, in the order to list them. */
  universities: University[];
  /** Site base path, e.g. /phdtv/. */
  base?: string;
}

/** The about page: what the site is, where its listings come from, and how to reach the maintainer. */
export function AboutPage({ universities, base = '/' }: AboutPageProps) {
  return (
    <article className="prose">
      <PageIntro
        title="About PhD TV"
        lede="A calendar of PhD defenses that universities livestream for free, and an archive of the recordings that stay online."
      />
      <p>
        In the Netherlands, the Nordic countries and elsewhere a PhD defense is a public ceremony, and most universities
        kept the livestream running after 2020. The listings are scattered across dozens of agenda pages. PhD TV gathers
        them in one place and shows them in your local time. There is a <a href={withBase(base, '/feeds/all.ics')}>calendar feed</a> you
        can subscribe to, and a <a href={withBase(base, '/api/defenses.json')}>JSON export</a> of the whole dataset.
      </p>

      <section>
        <h2>Where the listings come from</h2>
        <p>
          Every listing is taken from the university's own public agenda page, and every defense page links to the exact
          page it came from. At the moment each record is entered by hand by the maintainer after checking that page.
          Submissions and automated scrapers are planned; whichever way a listing arrives, it is reviewed before it is
          published.
        </p>
        <p>
          The dataset itself is a public <a href={REPOSITORY}>git repository</a>: every defense is one file, and every
          change is visible in its history.
        </p>
        <h3 id="institutions">Institutions covered</h3>
        <ul className="institutions" aria-labelledby="institutions">
          {universities.map((u) => {
            const href = u.agenda_url ?? u.website;
            return <li key={u.slug}>{href ? <a href={href}>{u.name}</a> : u.name}</li>;
          })}
        </ul>
      </section>

      <section>
        <h2>Corrections and removals</h2>
        <p>
          Candidates' names and thesis titles come from public university agendas. If you are listed and would rather
          not be, say so and the listing comes down. The same goes for a wrong time, a dead stream link, or a recording
          that has since been taken offline.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          PhD TV is made and maintained by <a href={MAINTAINER.profile}>{MAINTAINER.name}</a>. The quickest way to report
          something is to <a href={`${REPOSITORY}/issues`}>open an issue on GitHub</a>. You can also write to{' '}
          <a href={`mailto:${MAINTAINER.email}`}>{MAINTAINER.email}</a>.
        </p>
      </section>
    </article>
  );
}
