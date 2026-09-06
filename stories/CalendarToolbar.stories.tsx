import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { fn } from 'storybook/test';
import { CalendarToolbar } from '../src/components/CalendarToolbar.tsx';
import type { CalendarState } from '../src/lib/calendar.ts';
import { inColumn } from './support.tsx';

const today = '2026-09-07';

/** The toolbar is controlled; this wrapper holds the state so the buttons work in the story, and still reports every change. */
function StatefulToolbar(props: ComponentProps<typeof CalendarToolbar>) {
  const [state, setState] = useState<CalendarState>(props.state);
  const onChange = (next: CalendarState) => {
    setState(next);
    props.onChange(next);
  };
  return <CalendarToolbar {...props} state={state} onChange={onChange} />;
}

const meta = {
  component: CalendarToolbar,
  decorators: [inColumn],
  args: { state: { view: 'month', date: today }, today, onChange: fn() },
} satisfies Meta<typeof CalendarToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Month: Story = {};

export const Week: Story = { args: { state: { view: 'week', date: today } } };

/** A week that straddles two months gets both in its label. */
export const WeekAcrossMonths: Story = { args: { state: { view: 'week', date: '2026-09-30' } } };

export const Day: Story = { args: { state: { view: 'day', date: today } } };

export const Year: Story = { args: { state: { view: 'year', date: today } } };

export const Interactive: Story = { render: (args) => <StatefulToolbar {...args} /> };
