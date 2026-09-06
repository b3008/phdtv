// @vitest-environment jsdom
// Every component has stories, and every story renders. Storybook's portable-stories API composes each story with the
// project annotations from .storybook/preview.ts, so this is the same tree the Storybook preview mounts.
import { readdirSync } from 'node:fs';
import { render } from '@testing-library/react';
import { composeStories, setProjectAnnotations } from '@storybook/react-vite';
import type { ComponentType } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import preview from '../../.storybook/preview.ts';

type StoryModule = Parameters<typeof composeStories>[0];
/** Story names are only known per module, so the composed stories are typed as what they are: renderable components. */
type ComposedStories = Record<string, ComponentType>;

const project = setProjectAnnotations([preview]);
beforeAll(project.beforeAll);

const componentName = (file: string) => file.replace(/\.(stories\.)?tsx$/, '');
const components = readdirSync('src/components')
  .filter((file) => file.endsWith('.tsx'))
  .map(componentName)
  .sort();
const modules = import.meta.glob<StoryModule>('../../stories/*.stories.tsx', { eager: true });
const storyFiles = Object.keys(modules).sort();

describe('stories', () => {
  it('exist for every component in src/components', () => {
    expect(storyFiles.map((path) => componentName(path.split('/').at(-1) ?? path))).toEqual(components);
  });

  for (const path of storyFiles) {
    const stories = composeStories(modules[path] as StoryModule) as ComposedStories;
    describe(componentName(path.split('/').at(-1) ?? path), () => {
      for (const [name, Story] of Object.entries(stories)) {
        it(`renders ${name}`, () => {
          const { container } = render(<Story />);
          expect(container.firstElementChild).not.toBeNull();
        });
      }
    });
  }
});
