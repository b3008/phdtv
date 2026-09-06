// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Shell } from '../../src/components/Shell.tsx';

describe('Shell', () => {
  it('renders the site name and its children', () => {
    render(
      <Shell>
        <p>hello from the page</p>
      </Shell>,
    );
    expect(screen.getByRole('link', { name: 'PhD TV' })).toBeTruthy();
    expect(screen.getByText('hello from the page')).toBeTruthy();
  });

  it('links to the about page from the navigation and the footer, under the base path', () => {
    render(
      <Shell base="/phdtv/">
        <p>page</p>
      </Shell>,
    );
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'About' }).getAttribute('href')).toBe('/phdtv/about/');
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: /about this site/i }).getAttribute('href')).toBe('/phdtv/about/');
  });
});
