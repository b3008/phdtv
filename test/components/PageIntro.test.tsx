// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageIntro } from '../../src/components/PageIntro.tsx';

describe('PageIntro', () => {
  it('renders the page heading and lede', () => {
    render(<PageIntro title="Upcoming defenses" lede="Watch them live." />);
    expect(screen.getByRole('heading', { level: 1, name: 'Upcoming defenses' })).toBeTruthy();
    expect(screen.getByText('Watch them live.')).toBeTruthy();
  });
});
