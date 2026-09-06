// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Shell } from '../../src/components/Shell.tsx';

describe('Shell', () => {
  it('renders the masthead and its children', () => {
    render(
      <Shell>
        <p>hello from the page</p>
      </Shell>,
    );
    expect(screen.getByRole('link', { name: 'PhD TV' }).getAttribute('href')).toBe('/');
    expect(screen.getByText('hello from the page')).toBeTruthy();
  });

  it('links to the about page from the navigation and the footer, under the base path', () => {
    render(
      <Shell base="/phdtv/" current="about">
        <p>page</p>
      </Shell>,
    );
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const about = within(nav).getByRole('link', { name: 'About' });
    expect(about.getAttribute('href')).toBe('/phdtv/about/');
    expect(about.getAttribute('aria-current')).toBe('page');
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: /about this site/i }).getAttribute('href')).toBe('/phdtv/about/');
  });

  it('links to the calendar and to the recordings under the base path and marks the current page', () => {
    render(
      <Shell base="/phdtv/" current="calendar">
        <p />
      </Shell>,
    );
    const calendar = screen.getByRole('link', { name: 'Calendar' });
    expect(calendar.getAttribute('href')).toBe('/phdtv/');
    expect(calendar.getAttribute('aria-current')).toBe('page');
    const recordings = screen.getByRole('link', { name: 'Recordings' });
    expect(recordings.getAttribute('href')).toBe('/phdtv/?view=year&recorded=1');
    expect(recordings.getAttribute('aria-current')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Archive' })).toBeNull();
  });
});
