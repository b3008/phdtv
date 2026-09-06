import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageIntro } from '../src/components/PageIntro.tsx';

const meta = { component: PageIntro } satisfies Meta<typeof PageIntro>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = { args: { title: 'Past defenses' } };

export const WithLede: Story = {
  args: {
    title: 'PhD defenses you can watch live',
    lede: 'Public defenses streamed for free by universities, shown in your local time. Subscribe to the calendar feed to get them in your own calendar.',
  },
};
