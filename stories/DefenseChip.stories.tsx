import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { DefenseChip } from '../src/components/DefenseChip.tsx';
import { fixtureDefense, startingAt } from '../test/fixtures/defenses.ts';
import { DAY, discipline, MAJORS, PINNED_NOW } from './support.tsx';

/** Chips sit in the week and month columns, which are about this wide. */
const inCell: Decorator = (Story) => (
  <div style={{ maxWidth: '11rem' }}>
    <Story />
  </div>
);

const meta = {
  component: DefenseChip,
  decorators: [inCell],
  args: { defense: fixtureDefense(), phase: 'upcoming', zone: null, detail: 'week' },
} satisfies Meta<typeof DefenseChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Week: Story = {};

export const WeekLive: Story = { args: { defense: startingAt(PINNED_NOW, -15, { timezone: 'Europe/Amsterdam' }), phase: 'live' } };

export const WeekPast: Story = { args: { defense: startingAt(PINNED_NOW, -12 * DAY, { timezone: 'Europe/Amsterdam' }), phase: 'past' } };

/** Once the viewer's zone is known the chip shows the time in that zone. */
export const WeekInViewerZone: Story = { args: { zone: 'America/New_York' } };

export const Month: Story = { args: { detail: 'month' } };

export const MonthLive: Story = { args: { defense: startingAt(PINNED_NOW, -15, { timezone: 'Europe/Amsterdam' }), phase: 'live', detail: 'month' } };

/** One chip per major field, coloured by the first discipline, and one with no discipline at all. */
export const FieldColours: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      {MAJORS.map((m) => (
        <DefenseChip key={m.slug} {...args} defense={fixtureDefense({ key: m.slug, candidate: m.name, disciplines: [discipline(`${m.slug}-example`, m.name, m.slug)] })} />
      ))}
      <DefenseChip {...args} defense={fixtureDefense({ key: 'none', candidate: 'No discipline listed', disciplines: [] })} />
    </div>
  ),
};
