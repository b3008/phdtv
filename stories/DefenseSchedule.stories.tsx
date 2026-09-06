import type { Meta, StoryObj } from '@storybook/react-vite';
import { DefenseSchedule } from '../src/components/DefenseSchedule.tsx';
import { startingAt, type DefenseOverrides } from '../test/fixtures/defenses.ts';

// The schedule reads the real clock after it mounts, so the defenses are placed relative to the moment this module
// loads: the live one is live when opened. Reload the page after a long while to reset it.
const now = new Date();
const at = (minutesFromNow: number, overrides: DefenseOverrides) => startingAt(now, minutesFromNow, { timezone: 'Europe/Amsterdam', ...overrides });
const hours = 60;
const days = 24 * hours;

const uu = { slug: 'uu', name: 'Utrecht University', country: 'NL', website: 'https://www.uu.nl/' };
const uef = { slug: 'uef', name: 'University of Eastern Finland', country: 'FI', website: 'https://www.uef.fi/' };
const kth = { slug: 'kth', name: 'KTH Royal Institute of Technology', country: 'SE', website: 'https://www.kth.se/' };

const law = [{ slug: 'law', name: 'Law' }];
const physics = [{ slug: 'physical-sciences', name: 'Physical sciences' }];
const medicine = [{ slug: 'clinical-medicine', name: 'Clinical medicine' }];

const upcoming = [
  at(-10, { key: 'live', candidate: 'Jane Doe', title: 'Learning to schedule under uncertainty', durationMinutes: 90 }),
  at(2 * hours, { key: 'today', candidate: 'Pieter van den Berg', title: 'Contract law for autonomous agents', university: uu, faculty: 'Law, Economics and Governance', disciplines: law, stream: undefined }),
  at(26 * hours, { key: 'tomorrow-1', candidate: 'Aino Korhonen', title: 'Cold plasma sources for surface treatment', university: uef, timezone: 'Europe/Helsinki', faculty: 'Science, Forestry and Technology', disciplines: physics }),
  at(29 * hours, { key: 'tomorrow-2', candidate: 'Erik Lindqvist', title: 'Sensor fusion for indoor navigation', university: kth, timezone: 'Europe/Stockholm', faculty: undefined, stream: { url: 'https://www.youtube.com/watch?v=live1', platform: 'youtube' } }),
  at(6 * days, { key: 'next-week', candidate: 'Maria Koskinen', title: 'Early markers of sepsis in emergency care', university: uef, timezone: 'Europe/Helsinki', faculty: 'Health Sciences', disciplines: medicine, stream: { url: 'https://uef.zoom.us/j/1', platform: 'zoom' } }),
];

const archive = [
  at(-2 * days, { key: 'pending', candidate: 'Jane Doe', title: 'Learning to schedule under uncertainty' }),
  at(-9 * days, { key: 'recorded-youtube', candidate: 'Erik Lindqvist', title: 'Sensor fusion for indoor navigation', university: kth, timezone: 'Europe/Stockholm', faculty: undefined, recording: { url: 'https://www.youtube.com/watch?v=rec1', platform: 'youtube' } }),
  at(-20 * days, { key: 'not-recorded', candidate: 'Pieter van den Berg', title: 'Contract law for autonomous agents', university: uu, faculty: 'Law, Economics and Governance', disciplines: law, recording: { status: 'none' } }),
  at(-35 * days, { key: 'recorded-university', candidate: 'Aino Korhonen', title: 'Cold plasma sources for surface treatment', university: uef, timezone: 'Europe/Helsinki', faculty: 'Science, Forestry and Technology', disciplines: physics, recording: { url: 'https://uef.cloud.panopto.eu/1', platform: 'university' } }),
  at(-60 * days, { key: 'unknown', candidate: 'Maria Koskinen', title: 'Early markers of sepsis in emergency care', university: uef, timezone: 'Europe/Helsinki', faculty: 'Health Sciences', disciplines: medicine }),
];

const meta = {
  component: DefenseSchedule,
  args: { mode: 'upcoming', defenses: upcoming },
} satisfies Meta<typeof DefenseSchedule>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A defense in progress, two today, two tomorrow and one next week, from four institutions in three zones. */
export const Upcoming: Story = {};

export const UpcomingEmpty: Story = { args: { defenses: [] } };

/** All four recording states: pending, available on YouTube, not recorded, available on a university player, unknown. */
export const Archive: Story = { args: { mode: 'archive', defenses: archive } };

export const ArchiveEmpty: Story = { args: { mode: 'archive', defenses: [] } };
