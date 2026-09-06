import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { EmptyPeriod } from '../src/components/EmptyPeriod.tsx';
import { inColumn } from './support.tsx';

/** The dates that have a defense: one before and one after the empty periods below. */
const dates = ['2026-08-28', '2026-10-02'];

const meta = {
  component: EmptyPeriod,
  decorators: [inColumn],
  args: { state: { view: 'week', date: '2026-09-21' }, dates, onJump: fn() },
} satisfies Meta<typeof EmptyPeriod>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyWeek: Story = {};

export const EmptyDay: Story = { args: { state: { view: 'day', date: '2026-09-21' } } };

export const EmptyMonth: Story = { args: { state: { view: 'month', date: '2026-09-21' } } };

/** Nothing after the period: only the jump back. */
export const EmptyYear: Story = { args: { state: { view: 'year', date: '2027-01-01' } } };

/** No defenses listed at all: the sentence alone. */
export const NothingListed: Story = { args: { state: { view: 'month', date: '2026-09-21' }, dates: [] } };
