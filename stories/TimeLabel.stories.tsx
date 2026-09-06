import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimeLabel } from '../src/components/TimeLabel.tsx';

const meta = {
  component: TimeLabel,
  args: { startsAt: '2026-09-15T12:30:00+02:00', timezone: 'Europe/Amsterdam', viewerZone: null },
} satisfies Meta<typeof TimeLabel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Before the viewer's zone is known (build time and the first client render): the institution's time only. */
export const InstitutionOnly: Story = {};

export const ViewerInAnotherZone: Story = { args: { viewerZone: 'America/New_York' } };

/** A viewer in the institution's own zone gets no second time. */
export const ViewerInSameZone: Story = { args: { viewerZone: 'Europe/Amsterdam' } };

export const WithDate: Story = { args: { withDate: true, viewerZone: 'Europe/Helsinki' } };
