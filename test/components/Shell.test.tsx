// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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
