import type { Meta, StoryObj } from '@storybook/react-vite';
import { CenterfoldPage } from '../src/components/CenterfoldPage.tsx';
// The centerfold island's own stylesheet, which only its pages load on the site.
import '../src/styles/centerfold.css';
import { CENTERFOLD, DAY, featuredDefense, inColumn, RECORDINGS } from './support.tsx';

// The page reads the real clock after it mounts, so the defenses are placed relative to the moment this module
// loads: the live story is live when opened. Reload the page after a long while to reset it.
const now = new Date();
/** The centerfold with its three images left out. */
const { portrait: _portrait, wide: _wide, detail: _detail, ...editorialOnly } = CENTERFOLD;

const meta = {
  component: CenterfoldPage,
  decorators: [inColumn],
  args: { defense: featuredDefense(now, 3 * DAY) },
} satisfies Meta<typeof CenterfoldPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Every editorial field written and every image in place. */
export const Complete: Story = {};

/** Started five minutes ago: the live tag in the top bar and the stream in the tune-in bar. */
export const Live: Story = { args: { defense: featuredDefense(now, -5, { durationMinutes: 90 }) } };

export const PastWithRecording: Story = { args: { defense: featuredDefense(now, -40 * DAY, { recording: RECORDINGS.youtube }) } };

export const PastNotRecorded: Story = { args: { defense: featuredDefense(now, -40 * DAY, { recording: RECORDINGS.none }) } };

/** The photographs are still to come: the layout closes up around the text. */
export const WithoutImages: Story = { args: { defense: featuredDefense(now, 3 * DAY, { centerfold: editorialOnly }) } };

/** A centerfold with nothing written yet, as the deployed site shows it: only what the record itself provides. */
export const EmptyInProduction: Story = { args: { defense: featuredDefense(now, 3 * DAY, { centerfold: {} }) } };

/** The same empty centerfold in a preview build: a labelled slot for every field the editor still has to fill. */
export const EmptyInPreview: Story = { args: { defense: featuredDefense(now, 3 * DAY, { centerfold: {} }), preview: true } };
