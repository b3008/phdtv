// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
