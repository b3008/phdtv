import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { fn } from 'storybook/test';
import { FilterBar } from '../src/components/FilterBar.tsx';
import type { Filters } from '../src/lib/filters.ts';

const disciplines = [
  { slug: 'computer-and-information-sciences', name: 'Computer and information sciences' },
  { slug: 'law', name: 'Law' },
  { slug: 'physical-sciences', name: 'Physical sciences' },
];
const universities = [
  { slug: 'tudelft', name: 'Delft University of Technology' },
  { slug: 'uef', name: 'University of Eastern Finland' },
  { slug: 'uu', name: 'Utrecht University' },
];

/** The bar is controlled; this wrapper holds the filters so the selects change in the story, and still reports every change. */
function StatefulFilterBar(props: ComponentProps<typeof FilterBar>) {
  const [filters, setFilters] = useState<Filters>(props.filters);
  const onChange = (next: Filters) => {
    setFilters(next);
    props.onChange(next);
  };
  return <FilterBar {...props} filters={filters} onChange={onChange} />;
}

const meta = {
  component: FilterBar,
  args: { filters: {}, disciplines, universities, showRecordedOnly: false, onChange: fn() },
} satisfies Meta<typeof FilterBar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** As on the upcoming view: no recordings checkbox. */
export const Upcoming: Story = {};

export const Archive: Story = { args: { showRecordedOnly: true } };

export const WithSelection: Story = {
  args: { filters: { discipline: 'law', university: 'uu', recordedOnly: true }, showRecordedOnly: true },
};

export const Interactive: Story = {
  args: { showRecordedOnly: true },
  render: (args) => <StatefulFilterBar {...args} />,
};
