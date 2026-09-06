import type { Meta, StoryObj } from '@storybook/react-vite';
import { DefensePage } from '../src/components/DefensePage.tsx';
import { fixtureDefense, startingAt, type DefenseOverrides } from '../test/fixtures/defenses.ts';
import { DAY, featuredDefense, inColumn, RECORDINGS } from './support.tsx';

// The page reads the real clock after it mounts, so the defenses are placed relative to the moment this module
// loads: the live story is live when opened. Reload the page after a long while to reset it.
const now = new Date();
const at = (minutesFromNow: number, overrides: DefenseOverrides = {}) =>
  startingAt(now, minutesFromNow, { timezone: 'Europe/Amsterdam', durationMinutes: 90, ...overrides });

const meta = {
  component: DefensePage,
  decorators: [inColumn],
  args: { defense: at(3 * DAY) },
} satisfies Meta<typeof DefensePage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Upcoming: Story = {};

export const UpcomingWithoutStream: Story = { args: { defense: at(3 * DAY, { stream: undefined }) } };

/** Started five minutes ago. */
export const Live: Story = { args: { defense: at(-5) } };

/** A defense with a centerfold page carries the tag in the kicker line. */
export const WithCenterfold: Story = { args: { defense: featuredDefense(now, 3 * DAY) } };

export const PastWithRecording: Story = { args: { defense: at(-40 * DAY, { recording: RECORDINGS.youtube }) } };

export const PastNotRecorded: Story = { args: { defense: at(-40 * DAY, { recording: RECORDINGS.none }) } };

/** Ended three days ago; a recording may still appear. */
export const PastRecordingPending: Story = { args: { defense: at(-3 * DAY) } };

/** A record a visitor submitted, with none of the optional fields and no source page to link. */
export const MinimalSubmission: Story = {
  args: {
    defense: fixtureDefense({
      ...at(5 * DAY),
      university: { slug: 'nowhere', name: 'Somewhere University', country: 'FI' },
      faculty: undefined,
      disciplines: [],
      language: undefined,
      stream: undefined,
      thesisUrl: undefined,
      abstract: undefined,
      source: { channel: 'submitted' },
    }),
  },
};
