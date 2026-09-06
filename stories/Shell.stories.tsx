import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageIntro } from '../src/components/PageIntro.tsx';
import { Shell } from '../src/components/Shell.tsx';

const meta = {
  component: Shell,
  parameters: { layout: 'fullscreen' },
  args: {
    children: (
      <div className="column">
        <PageIntro kicker="Section" title="A page inside the shell" lede="The masthead band and the footer are the same on every page." />
        <p>The page content goes here, inside the column.</p>
      </div>
    ),
  },
} satisfies Meta<typeof Shell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnTheCalendar: Story = { args: { current: 'calendar' } };

export const OnTheAboutPage: Story = { args: { current: 'about' } };

/** Deployed under a path prefix: every navigation link starts with the base. */
export const WithBasePath: Story = { args: { base: '/phdtv/' } };
