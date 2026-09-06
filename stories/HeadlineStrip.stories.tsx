import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeadlineStrip, headlines } from '../src/components/HeadlineStrip.tsx';
import { PINNED_NOW, sampleDefenses, VIEWER_ZONE } from './support.tsx';

const sample = sampleDefenses(PINNED_NOW);

const meta = {
  component: HeadlineStrip,
  parameters: { layout: 'fullscreen' },
  args: { headlines: headlines(sample, PINNED_NOW, VIEWER_ZONE) },
} satisfies Meta<typeof HeadlineStrip>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A defense is in progress. The blurbs come from headlines(), as on the site. */
export const OnAir: Story = {};

/** Nothing in progress: the first blurb names the next defense and its date. */
export const NextUp: Story = {
  args: { headlines: headlines(sample.filter((d) => d.key !== 'live'), PINNED_NOW, VIEWER_ZONE) },
};

export const NothingScheduled: Story = { args: { headlines: headlines([], PINNED_NOW, VIEWER_ZONE) } };
