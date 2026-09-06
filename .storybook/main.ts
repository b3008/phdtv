import type { StorybookConfig } from '@storybook/react-vite';

// No vite.config.ts exists on purpose (the site build configures Vite inline), so Storybook runs on Vite's defaults.
const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../stories/**/*.stories.tsx'],
  core: { disableTelemetry: true },
};

export default config;
