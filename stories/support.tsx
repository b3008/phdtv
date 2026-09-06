// Shared story data: a pinned clock, the major fields, a handful of institutions and a month's worth of fictional
// defenses. Not a stories file itself (the globs match *.stories.tsx only).
import type { Decorator } from '@storybook/react-vite';
import type { MajorField } from '../src/components/MajorFieldLegend.tsx';
import type { Defense, DefenseCenterfold, DefenseDiscipline } from '../src/lib/defense.ts';
import { startingAt, type DefenseOverrides } from '../test/fixtures/defenses.ts';

export const HOUR = 60;
export const DAY = 24 * HOUR;

/** Monday 7 September 2026, 13:20 in Amsterdam: the clock for components that take `now` as a prop. */
export const PINNED_NOW = new Date('2026-09-07T11:20:00Z');
/** The viewer's zone in pinned stories, so grouping and times do not depend on the machine running Storybook. */
export const VIEWER_ZONE = 'Europe/Amsterdam';

/** Pages put their content inside the site's column; this gives a story the same width and padding. */
export const inColumn: Decorator = (Story) => (
  <div className="column">
    <Story />
  </div>
);

/** The six major fields of the vocabulary, in legend order; each has a --field-<slug> colour in the stylesheet. */
export const MAJORS: MajorField[] = [
  { slug: 'natural-sciences', name: 'Natural sciences' },
  { slug: 'engineering-and-technology', name: 'Engineering and technology' },
  { slug: 'medical-and-health-sciences', name: 'Medical and health sciences' },
  { slug: 'agricultural-and-veterinary-sciences', name: 'Agricultural and veterinary sciences' },
  { slug: 'social-sciences', name: 'Social sciences' },
  { slug: 'humanities-and-the-arts', name: 'Humanities and the arts' },
];

export function discipline(slug: string, name: string, major: string): DefenseDiscipline {
  return { slug, name, major, majorName: MAJORS.find((m) => m.slug === major)?.name ?? major };
}

export const DISCIPLINES = {
  computing: discipline('computer-and-information-sciences', 'Computer and information sciences', 'natural-sciences'),
  physics: discipline('physical-sciences', 'Physical sciences', 'natural-sciences'),
  earth: discipline('earth-and-environmental-sciences', 'Earth and related environmental sciences', 'natural-sciences'),
  electrical: discipline('electrical-electronic-and-information-engineering', 'Electrical, electronic and information engineering', 'engineering-and-technology'),
  civil: discipline('civil-engineering', 'Civil engineering', 'engineering-and-technology'),
  medicine: discipline('clinical-medicine', 'Clinical medicine', 'medical-and-health-sciences'),
  agriculture: discipline('agriculture-forestry-and-fisheries', 'Agriculture, forestry and fisheries', 'agricultural-and-veterinary-sciences'),
  law: discipline('law', 'Law', 'social-sciences'),
  history: discipline('history-and-archaeology', 'History and archaeology', 'humanities-and-the-arts'),
  arts: discipline('arts', 'Art', 'humanities-and-the-arts'),
};

export const UNIVERSITIES: Record<'tudelft' | 'uu' | 'wur' | 'uef' | 'aalto' | 'kth', Defense['university']> = {
  tudelft: { slug: 'tudelft', name: 'Delft University of Technology', shortName: 'TU Delft', country: 'NL', website: 'https://www.tudelft.nl/' },
  uu: { slug: 'uu', name: 'Utrecht University', shortName: 'UU', country: 'NL', website: 'https://www.uu.nl/' },
  wur: { slug: 'wur', name: 'Wageningen University & Research', shortName: 'WUR', country: 'NL', website: 'https://www.wur.nl/' },
  uef: { slug: 'uef', name: 'University of Eastern Finland', shortName: 'UEF', country: 'FI', website: 'https://www.uef.fi/' },
  aalto: { slug: 'aalto', name: 'Aalto University', shortName: 'Aalto', country: 'FI', website: 'https://www.aalto.fi/' },
  kth: { slug: 'kth', name: 'KTH Royal Institute of Technology', shortName: 'KTH', country: 'SE', website: 'https://www.kth.se/' },
};

export const RECORDINGS = {
  youtube: { url: 'https://www.youtube.com/watch?v=abc123', platform: 'youtube' },
  vimeo: { url: 'https://vimeo.com/123456789', platform: 'vimeo' },
  university: { url: 'https://collegerama.tudelft.nl/recordings/1', platform: 'university' },
  none: { status: 'none' },
} as const;

/** An inline SVG stand-in for the editorial photographs, which live outside the repository. */
export function placeholderImage(label: string, width: number, height: number, fill: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="${fill}"/>` +
    `<text x="50%" y="50%" fill="#fff" font-family="sans-serif" font-size="${Math.round(height / 10)}" text-anchor="middle" dominant-baseline="middle">${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Every editorial field filled in. */
export const CENTERFOLD: DefenseCenterfold = {
  issue: 'No. 37',
  kicker: "This week's centerfold",
  standfirst:
    'Every phone call, video stream and sensor reading costs energy somewhere in the network. This defense asks how little a wireless link can get away with.',
  portrait: placeholderImage('Portrait', 600, 800, '#1d4ed8'),
  wide: placeholderImage('The lab', 1200, 500, '#00a9e0'),
  detail: placeholderImage('Figure 3.2', 800, 400, '#615a4f'),
  quote: 'How little can a wireless link get away with?',
  questions: [
    { q: 'Why this topic?', a: 'Because every phone call costs energy somewhere in the network, and nobody had measured how little it could cost.' },
    { q: 'What surprised you?', a: 'That the cheapest link was rarely the slowest one.' },
    { q: 'What happens after the defense?', a: 'A postdoc in Lund, and a long walk.' },
  ],
  facts: [
    ['Faculty', 'Electrical Engineering and Computer Science'],
    ['Format', 'Public defense, livestreamed'],
    ['Language', 'English'],
  ],
};

/** One defense `minutesFromNow` after `now`, keyed for its listing URL, in Amsterdam unless overridden. */
export function defenseAt(now: Date, key: string, minutesFromNow: number, overrides: DefenseOverrides = {}): Defense {
  return startingAt(now, minutesFromNow, { key, url: `/defenses/${key}/`, listingUrl: `/defenses/${key}/`, timezone: 'Europe/Amsterdam', ...overrides });
}

/** The featured defense, with a full centerfold; its `url` is the centerfold page. */
export function featuredDefense(now: Date, minutesFromNow: number, overrides: DefenseOverrides = {}): Defense {
  return defenseAt(now, 'featured', minutesFromNow, {
    url: '/centerfold/featured/',
    candidate: 'Erik Lindqvist',
    title: 'Energy-aware scheduling for low-power wireless links',
    university: UNIVERSITIES.kth,
    timezone: 'Europe/Stockholm',
    faculty: 'Electrical Engineering and Computer Science',
    disciplines: [DISCIPLINES.electrical],
    stream: { url: 'https://www.youtube.com/watch?v=kth-live', platform: 'youtube' },
    thesisUrl: undefined,
    abstract: undefined,
    source: { channel: 'curated' },
    centerfold: CENTERFOLD,
    ...overrides,
  });
}

/**
 * A month's worth of fictional defenses around `now`: one in progress, the rest of this week, two next week, a
 * busy day in three weeks, the following months, and a past with every recording state.
 */
export function sampleDefenses(now: Date): Defense[] {
  const at = (key: string, minutes: number, overrides: DefenseOverrides = {}) => defenseAt(now, key, minutes, overrides);
  const helsinki = { timezone: 'Europe/Helsinki' };
  const stockholm = { timezone: 'Europe/Stockholm' };
  return [
    at('live', -10, { durationMinutes: 90 }),
    at('today-later', 3 * HOUR, { candidate: 'Pieter van den Berg', title: 'Contract law for autonomous agents', university: UNIVERSITIES.uu, faculty: 'Law, Economics and Governance', disciplines: [DISCIPLINES.law], stream: undefined }),
    at('tomorrow', DAY - 2 * HOUR, { ...helsinki, candidate: 'Aino Korhonen', title: 'Cold plasma sources for surface treatment', university: UNIVERSITIES.aalto, faculty: 'School of Science', disciplines: [DISCIPLINES.physics] }),
    featuredDefense(now, 2 * DAY - 3 * HOUR),
    at('wednesday-2', 2 * DAY + HOUR, { candidate: 'Wei Lin', title: 'Root traits under drought in bread wheat', university: UNIVERSITIES.wur, faculty: 'Plant Sciences', disciplines: [DISCIPLINES.agriculture], stream: { url: 'https://wur.yuja.com/live/1', platform: 'university' } }),
    at('thursday', 3 * DAY, { ...helsinki, candidate: 'Maria Koskinen', title: 'Early markers of sepsis in emergency care', university: UNIVERSITIES.uef, faculty: 'Health Sciences', disciplines: [DISCIPLINES.medicine], stream: { url: 'https://uef.zoom.us/j/1', platform: 'zoom' } }),
    at('friday', 4 * DAY - HOUR, { candidate: 'Sanne de Vries', title: 'Reading the margins of medieval account books', university: UNIVERSITIES.uu, faculty: 'Humanities', disciplines: [DISCIPLINES.history], language: 'nl', stream: undefined }),
    at('next-tuesday', 8 * DAY, { candidate: 'Joris Bakker', title: 'Fatigue in welded steel bridge decks', faculty: 'Civil Engineering and Geosciences', disciplines: [DISCIPLINES.civil] }),
    at('next-thursday', 10 * DAY, { ...stockholm, candidate: 'Mei Zhang', title: 'Learning-based control of legged robots', university: UNIVERSITIES.kth, faculty: undefined, disciplines: [DISCIPLINES.electrical], stream: { url: 'https://www.youtube.com/watch?v=kth-2', platform: 'youtube' } }),
    at('busy-day-1', 23 * DAY - 4 * HOUR, { candidate: 'Nadia Rahimi', title: 'Trust in algorithmic public services', university: UNIVERSITIES.uu, faculty: 'Law, Economics and Governance', disciplines: [DISCIPLINES.law] }),
    at('busy-day-2', 23 * DAY, { candidate: 'Lars Holm', title: 'Photonic crystals for on-chip sensing', faculty: 'Applied Sciences', disciplines: [DISCIPLINES.physics] }),
    at('busy-day-3', 23 * DAY + 2 * HOUR, { ...helsinki, candidate: 'Ville Niemi', title: 'Peatland restoration and the carbon balance', university: UNIVERSITIES.uef, faculty: 'Science, Forestry and Technology', disciplines: [DISCIPLINES.earth] }),
    at('next-month', 35 * DAY, { candidate: 'Ingrid Solberg', title: 'Coastal dialects in contact', university: UNIVERSITIES.uu, faculty: 'Humanities', disciplines: [DISCIPLINES.history], stream: undefined }),
    at('in-two-months', 62 * DAY, { ...helsinki, candidate: 'Tomás Herrera', title: 'Sound design for public spaces', university: UNIVERSITIES.aalto, faculty: 'School of Arts, Design and Architecture', disciplines: [DISCIPLINES.arts] }),
    at('past-pending', -3 * DAY, { candidate: 'Fatima El Amrani', title: 'Microplastics in Dutch estuaries', university: UNIVERSITIES.wur, faculty: 'Environmental Sciences', disciplines: [DISCIPLINES.earth] }),
    at('past-youtube', -12 * DAY, { ...helsinki, candidate: 'Jonas Weber', title: 'Graph neural networks for molecule design', university: UNIVERSITIES.aalto, faculty: 'School of Science', recording: RECORDINGS.youtube }),
    at('past-none', -25 * DAY, { ...stockholm, candidate: 'Karin Lindgren', title: 'Grid-forming converters for weak grids', university: UNIVERSITIES.kth, faculty: undefined, disciplines: [DISCIPLINES.electrical], recording: RECORDINGS.none }),
    at('past-university', -45 * DAY, { ...helsinki, candidate: 'Elina Virtanen', title: 'Nurse-led follow-up after cardiac surgery', university: UNIVERSITIES.uef, faculty: 'Health Sciences', disciplines: [DISCIPLINES.medicine], recording: RECORDINGS.university }),
    at('past-unknown', -70 * DAY, { candidate: 'Daniel Okafor', title: 'Interpretable models for credit risk' }),
    at('past-vimeo', -100 * DAY, { candidate: 'Lucía Ortega', title: 'Reciprocity in early modern diplomacy', university: UNIVERSITIES.uu, faculty: 'Humanities', disciplines: [DISCIPLINES.history], recording: RECORDINGS.vimeo }),
  ];
}
