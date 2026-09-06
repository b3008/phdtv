import type { Meta, StoryObj } from '@storybook/react-vite';
import { WeekView } from '../src/components/WeekView.tsx';
import { addDays, groupByDate, todayIn } from '../src/lib/calendar.ts';
import { inColumn, PINNED_NOW, sampleDefenses, VIEWER_ZONE } from './support.tsx';

const groups = groupByDate(sampleDefenses(PINNED_NOW), VIEWER_ZONE);
const today = todayIn(VIEWER_ZONE, PINNED_NOW);

const meta = {
  component: WeekView,
  decorators: [inColumn],
  args: { date: today, groups, today, now: PINNED_NOW, zone: VIEWER_ZONE },
} satisfies Meta<typeof WeekView>;
export default meta;
type Story = StoryObj<typeof meta>;

/** This week: today carries the NOW tag, one chip is live. */
export const ThisWeek: Story = {};

export const NextWeek: Story = { args: { date: addDays(today, 7) } };

/** The parent shows the empty-period sentence above; the seven columns still render. */
export const EmptyWeek: Story = { args: { date: addDays(today, 14) } };

/** Before the viewer's zone is known: chips show institution-local times. */
export const BeforeMount: Story = { args: { groups: groupByDate(sampleDefenses(PINNED_NOW), null), zone: null } };
