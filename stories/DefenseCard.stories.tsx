import type { Meta, StoryObj } from '@storybook/react-vite';
import { DefenseCard } from '../src/components/DefenseCard.tsx';
import { fixtureDefense, startingAt, type DefenseOverrides } from '../test/fixtures/defenses.ts';
import { DAY, featuredDefense, inColumn, PINNED_NOW, RECORDINGS } from './support.tsx';

/** The card takes `now` and `phase` as props, so these stories never drift. */
const at = (minutesFromNow: number, overrides: DefenseOverrides = {}) => startingAt(PINNED_NOW, minutesFromNow, { timezone: 'Europe/Amsterdam', ...overrides });

const meta = {
  component: DefenseCard,
  decorators: [inColumn],
  args: { defense: fixtureDefense(), phase: 'upcoming', now: PINNED_NOW, viewerZone: null },
} satisfies Meta<typeof DefenseCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Upcoming: Story = {};

export const UpcomingWithoutStream: Story = { args: { defense: fixtureDefense({ stream: undefined }) } };

export const ViewerInAnotherZone: Story = { args: { viewerZone: 'America/New_York' } };

export const Live: Story = { args: { defense: at(-15), phase: 'live' } };

export const LiveWithoutStream: Story = { args: { defense: at(-15, { stream: undefined }), phase: 'live' } };

/** A defense with a centerfold page carries the tag, and its links go to the centerfold. */
export const WithCenterfold: Story = { args: { defense: featuredDefense(PINNED_NOW, 2 * DAY) } };

/** Without a faculty, disciplines (so no field colour) or stream link: only the required fields. */
export const MinimalFields: Story = {
  args: { defense: fixtureDefense({ faculty: undefined, disciplines: [], stream: undefined, language: undefined }) },
};

export const PastWithRecording: Story = { args: { defense: at(-40 * DAY, { recording: RECORDINGS.youtube }), phase: 'past' } };

export const PastNotRecorded: Story = { args: { defense: at(-40 * DAY, { recording: RECORDINGS.none }), phase: 'past' } };

/** Ended three days ago with no recording yet. */
export const PastPending: Story = { args: { defense: at(-3 * DAY), phase: 'past' } };

/** Ended long ago and nothing was ever published. */
export const PastUnknown: Story = { args: { defense: at(-45 * DAY), phase: 'past' } };
