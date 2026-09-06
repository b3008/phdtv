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

  it('renders a kicker and a highlighted ending of the title', () => {
    render(<PageIntro kicker="Special issue" title="PhD defenses you can" highlight="watch live" />);
    expect(screen.getByRole('heading', { level: 1, name: 'PhD defenses you can watch live' })).toBeTruthy();
    expect(screen.getByText('Special issue').className).toBe('kicker');
    expect(screen.getByText('watch live').className).toBe('page-title-accent');
  });
});
