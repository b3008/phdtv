import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecordingStatus } from '../src/components/RecordingStatus.tsx';
import { fixtureDefense, startingAt } from '../test/fixtures/defenses.ts';

/** A pinned clock, so the pending and unknown states below stay what they are. */
const NOW = new Date('2026-09-15T10:00:00Z');
const daysAgo = (days: number) => startingAt(NOW, -days * 24 * 60, { timezone: 'Europe/Amsterdam' });

const meta = {
  component: RecordingStatus,
  args: { now: NOW, defense: fixtureDefense() },
} satisfies Meta<typeof RecordingStatus>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {
  args: { defense: fixtureDefense({ recording: { url: 'https://www.youtube.com/watch?v=abc123', platform: 'youtube' } }) },
};

export const NotRecorded: Story = { args: { defense: fixtureDefense({ recording: { status: 'none' } }) } };

/** No recording known yet, but the defense ended less than thirty days ago. */
export const Pending: Story = { args: { defense: daysAgo(3) } };

/** No recording known and the thirty days have passed. */
export const Unknown: Story = { args: { defense: daysAgo(45) } };
