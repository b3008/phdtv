import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageIntro } from '../src/components/PageIntro.tsx';
import { inColumn } from './support.tsx';

const meta = { component: PageIntro, decorators: [inColumn] } satisfies Meta<typeof PageIntro>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = { args: { title: 'About PhD TV' } };

export const WithLede: Story = {
  args: {
    title: 'About PhD TV',
    lede: 'A calendar of PhD defenses that universities livestream for free, and an archive of the recordings that stay online.',
  },
};

/** As on the home page: a kicker above, the last words of the title in the live red. */
export const HomePage: Story = {
  args: {
    kicker: 'Special issue',
    title: 'PhD defenses you can',
    highlight: 'watch live',
    lede: 'Public defenses streamed for free by universities, shown in your local time. Browse by day, week, month or year. Past dates show where a recording exists. Subscribe to the calendar feed to get them in your own calendar.',
  },
};
