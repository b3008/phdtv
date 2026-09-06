import type { Meta, StoryObj } from '@storybook/react-vite';
import { DefensePage } from '../src/components/DefensePage.tsx';
import { fixtureDefense, startingAt, type DefenseOverrides } from '../test/fixtures/defenses.ts';

// The page reads the real clock after it mounts, so the defenses are placed relative to the moment this module
// loads: the live story is live when opened. Reload the page after a long while to reset it.
const now = new Date();
const at = (minutesFromNow: number, overrides: DefenseOverrides = {}) =>
  startingAt(now, minutesFromNow, { timezone: 'Europe/Amsterdam', durationMinutes: 90, ...overrides });
const recording = { url: 'https://www.youtube.com/watch?v=abc123', platform: 'youtube' } as const;

const meta = {
  component: DefensePage,
  args: { defense: at(3 * 24 * 60) },
} satisfies Meta<typeof DefensePage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Upcoming: Story = {};

export const UpcomingWithoutStream: Story = { args: { defense: at(3 * 24 * 60, { stream: undefined }) } };

/** Started five minutes ago. */
export const Live: Story = { args: { defense: at(-5) } };

export const PastWithRecording: Story = { args: { defense: at(-40 * 24 * 60, { recording }) } };

export const PastNotRecorded: Story = { args: { defense: at(-40 * 24 * 60, { recording: { status: 'none' } }) } };

/** Ended three days ago; a recording may still appear. */
export const PastRecordingPending: Story = { args: { defense: at(-3 * 24 * 60) } };

/** A record a visitor submitted, with none of the optional fields and no source page to link. */
export const MinimalSubmission: Story = {
  args: {
    defense: fixtureDefense({
      ...at(5 * 24 * 60),
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
