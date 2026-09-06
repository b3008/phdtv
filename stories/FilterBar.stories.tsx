import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { fn } from 'storybook/test';
import { FilterBar } from '../src/components/FilterBar.tsx';
import type { Filters } from '../src/lib/filters.ts';
import { inColumn } from './support.tsx';

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

/** The bar is controlled; this wrapper holds the filters so the controls change in the story, and still reports every change. */
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
  decorators: [inColumn],
  args: { filters: {}, disciplines, universities, onChange: fn() },
} satisfies Meta<typeof FilterBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = { args: { filters: { discipline: 'law', university: 'uu', recordedOnly: true } } };

export const Interactive: Story = { render: (args) => <StatefulFilterBar {...args} /> };
