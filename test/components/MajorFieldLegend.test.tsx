// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MajorFieldLegend } from '../../src/components/MajorFieldLegend.tsx';

describe('MajorFieldLegend', () => {
  it('lists one swatch per major field', () => {
    render(<MajorFieldLegend majors={[{ slug: 'natural-sciences', name: 'Natural sciences' }, { slug: 'social-sciences', name: 'Social sciences' }]} />);
    const items = within(screen.getByRole('list', { name: 'Major fields' })).getAllByRole('listitem');
    expect(items.map((i) => i.textContent)).toEqual(['Natural sciences', 'Social sciences']);
    expect(items[0]?.className).toBe('field-natural-sciences');
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<MajorFieldLegend majors={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
