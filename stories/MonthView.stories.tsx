import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { MonthView } from '../src/components/MonthView.tsx';
import { groupByDate, todayIn } from '../src/lib/calendar.ts';
import { inColumn, PINNED_NOW, sampleDefenses, VIEWER_ZONE } from './support.tsx';

const groups = groupByDate(sampleDefenses(PINNED_NOW), VIEWER_ZONE);
const today = todayIn(VIEWER_ZONE, PINNED_NOW);

const meta = {
  component: MonthView,
  decorators: [inColumn],
  args: { date: today, groups, today, now: PINNED_NOW, zone: VIEWER_ZONE, onOpenDay: fn() },
} satisfies Meta<typeof MonthView>;
export default meta;
type Story = StoryObj<typeof meta>;

/** This month: today outlined, a live chip, a busy day with three defenses at the end. */
export const ThisMonth: Story = {};

/** Next month: the padding days at the start still carry their chips, dimmed. */
export const NextMonth: Story = { args: { date: '2026-10-07' } };

/** A past month: chips for recorded defenses look the same, the phase class dims them. */
export const PastMonth: Story = { args: { date: '2026-08-07' } };

/** On a narrow screen the chips give way to dots, and tapping a cell opens the day. */
export const Narrow: Story = { globals: { viewport: { value: 'mobile1', isRotated: false } } };
