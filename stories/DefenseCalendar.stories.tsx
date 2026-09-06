import type { Meta, StoryObj } from '@storybook/react-vite';
import { DefenseCalendar } from '../src/components/DefenseCalendar.tsx';
import { MAJORS, sampleDefenses } from './support.tsx';

// The island reads the real clock after it mounts, so the defenses are placed relative to the moment this module
// loads: the calendar opens on the current month with one defense in progress. Reload after a long while to reset it.
const now = new Date();

const meta = {
  component: DefenseCalendar,
  parameters: { layout: 'fullscreen' },
  args: { defenses: sampleDefenses(now), majors: MAJORS, renderedAt: now.toISOString() },
} satisfies Meta<typeof DefenseCalendar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The whole home page below the masthead. Switch views and filter with the controls in the story itself. */
export const Default: Story = {};

/** Nothing listed at all: the headlines say so and the month shows the empty-period sentence with no jumps. */
export const NoDefenses: Story = { args: { defenses: [] } };
