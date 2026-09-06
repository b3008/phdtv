import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { YearView } from '../src/components/YearView.tsx';
import { groupByDate, todayIn } from '../src/lib/calendar.ts';
import { inColumn, PINNED_NOW, sampleDefenses, VIEWER_ZONE } from './support.tsx';

const groups = groupByDate(sampleDefenses(PINNED_NOW), VIEWER_ZONE);

const meta = {
  component: YearView,
  decorators: [inColumn],
  args: { date: todayIn(VIEWER_ZONE, PINNED_NOW), groups, onOpenMonth: fn(), onOpenDay: fn() },
} satisfies Meta<typeof YearView>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Days shaded by how many defenses they hold: one, two, three or more. */
export const ThisYear: Story = {};

export const EmptyYear: Story = { args: { date: '2027-01-01' } };
