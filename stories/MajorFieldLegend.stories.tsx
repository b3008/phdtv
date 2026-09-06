import type { Meta, StoryObj } from '@storybook/react-vite';
import { MajorFieldLegend } from '../src/components/MajorFieldLegend.tsx';
import { inColumn, MAJORS } from './support.tsx';

const meta = {
  component: MajorFieldLegend,
  decorators: [inColumn],
  args: { majors: MAJORS },
} satisfies Meta<typeof MajorFieldLegend>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Every major field of the vocabulary with its colour. */
export const AllFields: Story = {};

/** The calendar shows only the fields present among the listed defenses. */
export const PresentFields: Story = { args: { majors: MAJORS.filter((m) => ['natural-sciences', 'engineering-and-technology', 'social-sciences'].includes(m.slug)) } };
