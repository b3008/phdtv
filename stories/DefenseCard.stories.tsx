import type { Meta, StoryObj } from '@storybook/react-vite';
import { DefenseCard } from '../src/components/DefenseCard.tsx';
import { fixtureDefense, startingAt, type DefenseOverrides } from '../test/fixtures/defenses.ts';

/** A pinned clock: the card takes `now` and `phase` as props, so these stories never drift. */
const NOW = new Date('2026-09-15T10:00:00Z');
const at = (minutesFromNow: number, overrides: DefenseOverrides = {}) =>
  startingAt(NOW, minutesFromNow, { timezone: 'Europe/Amsterdam', ...overrides });
const recording = { url: 'https://www.youtube.com/watch?v=abc123', platform: 'youtube' } as const;

const meta = {
  component: DefenseCard,
  args: { defense: fixtureDefense(), phase: 'upcoming', now: NOW, viewerZone: null, mode: 'upcoming' },
} satisfies Meta<typeof DefenseCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Upcoming: Story = {};

export const UpcomingWithoutStream: Story = { args: { defense: fixtureDefense({ stream: undefined }) } };

export const ViewerInAnotherZone: Story = { args: { viewerZone: 'America/New_York' } };

export const Live: Story = { args: { defense: at(-15), phase: 'live' } };

export const LiveWithoutStream: Story = { args: { defense: at(-15, { stream: undefined }), phase: 'live' } };

/** Without a faculty, disciplines or stream link: only the required fields. */
export const MinimalFields: Story = {
  args: { defense: fixtureDefense({ faculty: undefined, disciplines: [], stream: undefined, language: undefined }) },
};

const archive = { mode: 'archive', phase: 'past' } as const;

export const ArchiveWithRecording: Story = { args: { ...archive, defense: at(-40 * 24 * 60, { recording }) } };

export const ArchiveNotRecorded: Story = { args: { ...archive, defense: at(-40 * 24 * 60, { recording: { status: 'none' } }) } };

/** Ended three days ago with no recording yet. */
export const ArchivePending: Story = { args: { ...archive, defense: at(-3 * 24 * 60) } };

/** Ended long ago and nothing was ever published. */
export const ArchiveUnknown: Story = { args: { ...archive, defense: at(-45 * 24 * 60) } };
