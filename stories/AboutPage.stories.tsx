import type { Meta, StoryObj } from '@storybook/react-vite';
import { AboutPage } from '../src/components/AboutPage.tsx';
import type { University } from '../src/schema/university.ts';

const universities: University[] = [
  { slug: 'aalto', name: 'Aalto University', country: 'FI', timezone: 'Europe/Helsinki', website: 'https://www.aalto.fi/', agenda_url: 'https://www.aalto.fi/en/events' },
  { slug: 'kth', name: 'KTH Royal Institute of Technology', country: 'SE', timezone: 'Europe/Stockholm', website: 'https://www.kth.se/', agenda_url: 'https://www.kth.se/en/aktuellt/kalender' },
  { slug: 'tudelft', name: 'Delft University of Technology', country: 'NL', timezone: 'Europe/Amsterdam', website: 'https://www.tudelft.nl/', agenda_url: 'https://www.tudelft.nl/en/events' },
  { slug: 'uef', name: 'University of Eastern Finland', country: 'FI', timezone: 'Europe/Helsinki', website: 'https://www.uef.fi/' },
  { slug: 'uu', name: 'Utrecht University', country: 'NL', timezone: 'Europe/Amsterdam', website: 'https://www.uu.nl/', agenda_url: 'https://www.uu.nl/en/events' },
  { slug: 'nowhere', name: 'Somewhere University', country: 'XX', timezone: 'UTC' },
];

const meta = {
  component: AboutPage,
  args: { universities },
} satisfies Meta<typeof AboutPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Institutions link to their agenda page, else their website, else nothing. */
export const Default: Story = {};

/** Deployed under a path prefix: the feed and export links start with the base. */
export const WithBasePath: Story = { args: { base: '/phdtv/' } };
