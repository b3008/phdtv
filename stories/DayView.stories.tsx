import type { Meta, StoryObj } from '@storybook/react-vite';
import { DayView } from '../src/components/DayView.tsx';
import { groupByDate, todayIn } from '../src/lib/calendar.ts';
import { inColumn, PINNED_NOW, sampleDefenses, VIEWER_ZONE } from './support.tsx';

const groups = groupByDate(sampleDefenses(PINNED_NOW), VIEWER_ZONE);
const today = todayIn(VIEWER_ZONE, PINNED_NOW);
const defensesOn = (date: string) => groups.get(date) ?? [];

const meta = {
  component: DayView,
  decorators: [inColumn],
  args: { date: today, defenses: defensesOn(today), now: PINNED_NOW, zone: VIEWER_ZONE },
} satisfies Meta<typeof DayView>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Today: one defense in progress and one later in the afternoon. */
export const Today: Story = {};

/** Two institutions in two zones, one with a centerfold. */
export const Wednesday: Story = { args: { date: '2026-09-09', defenses: defensesOn('2026-09-09') } };

/** A past day: the card shows the recording instead of the stream. */
export const PastDay: Story = { args: { date: '2026-08-26', defenses: defensesOn('2026-08-26') } };
