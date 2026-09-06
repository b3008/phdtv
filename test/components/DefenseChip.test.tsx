// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { chipTooltip, DefenseChip, fieldClass } from '../../src/components/DefenseChip.tsx';
import { fixtureDefense } from '../fixtures/defenses.ts';

describe('DefenseChip', () => {
  const defense = fixtureDefense();

  it('links to the defense page with the time, the name and the institution badge in week detail', () => {
    render(<DefenseChip defense={defense} phase="upcoming" zone={null} detail="week" />);
    const link = screen.getByRole('link', { name: /Jane Doe/ });
    expect(link.getAttribute('href')).toBe('/defenses/2026/2026-09-15-tudelft-jane-doe/');
    expect(link.className).toContain('field-natural-sciences');
    expect(link.getAttribute('title')).toBe(
      'Learning to schedule under uncertainty · Delft University of Technology · 12:30 CEST · Computer and information sciences',
    );
    expect(screen.getByText('12:30')).toBeTruthy();
    expect(screen.getByText('TU Delft')).toBeTruthy();
    expect(screen.queryByText('Live')).toBeNull();
  });

  it('shows the time in the viewer zone once known', () => {
    render(<DefenseChip defense={defense} phase="upcoming" zone="America/New_York" detail="month" />);
    expect(screen.getByText('06:30')).toBeTruthy();
  });

  it('marks live and past chips and drops the badge in month detail', () => {
    const { container, rerender } = render(<DefenseChip defense={defense} phase="live" zone={null} detail="month" />);
    expect(screen.getByText('Live')).toBeTruthy();
    expect(screen.queryByText('TU Delft')).toBeNull();
    rerender(<DefenseChip defense={defense} phase="past" zone={null} detail="month" />);
    expect(container.querySelector('.chip-past')).toBeTruthy();
  });

  it('falls back to a neutral field class and a shorter tooltip without disciplines', () => {
    const bare = fixtureDefense({ disciplines: [] });
    expect(fieldClass(bare)).toBe('field-none');
    expect(chipTooltip(bare)).toBe('Learning to schedule under uncertainty · Delft University of Technology · 12:30 CEST');
  });
});
