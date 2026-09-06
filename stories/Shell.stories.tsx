import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageIntro } from '../src/components/PageIntro.tsx';
import { Shell } from '../src/components/Shell.tsx';

const meta = {
  component: Shell,
  parameters: { layout: 'fullscreen' },
  args: {
    children: (
      <>
        <PageIntro title="A page inside the shell" lede="The header, the navigation and the footer are the same on every page." />
        <p>The page content goes here.</p>
      </>
    ),
  },
} satisfies Meta<typeof Shell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Deployed under a path prefix: every navigation link starts with the base. */
export const WithBasePath: Story = { args: { base: '/phdtv/' } };
