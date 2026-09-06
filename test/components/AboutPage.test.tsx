// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AboutPage } from '../../src/components/AboutPage.tsx';
import type { University } from '../../src/schema/university.ts';

const universities: University[] = [
  { slug: 'tudelft', name: 'Delft University of Technology', country: 'NL', timezone: 'Europe/Amsterdam', website: 'https://www.tudelft.nl/', agenda_url: 'https://www.tudelft.nl/en/events' },
  { slug: 'uef', name: 'University of Eastern Finland', country: 'FI', timezone: 'Europe/Helsinki', website: 'https://www.uef.fi/' },
  { slug: 'nowhere', name: 'Somewhere University', country: 'XX', timezone: 'UTC' },
];

describe('AboutPage', () => {
  it('names the maintainer and links to the issue tracker and the email address', () => {
    render(<AboutPage universities={universities} base="/" />);
    expect(screen.getByRole('link', { name: 'Nikolaos Batalas' }).getAttribute('href')).toBe('https://github.com/b3008');
    expect(screen.getByRole('link', { name: /open an issue/i }).getAttribute('href')).toBe('https://github.com/b3008/phdtv/issues');
    expect(screen.getByRole('link', { name: 'nikolaos.batalas@gmail.com' }).getAttribute('href')).toBe('mailto:nikolaos.batalas@gmail.com');
  });

  it('lists each institution linked to its agenda page, its website when there is no agenda page, or plain when there is neither', () => {
    render(<AboutPage universities={universities} base="/" />);
    const list = screen.getByRole('list', { name: /institutions/i });
    expect(within(list).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Delft University of Technology',
      'University of Eastern Finland',
      'Somewhere University',
    ]);
    expect(within(list).getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Delft University of Technology', 'https://www.tudelft.nl/en/events'],
      ['University of Eastern Finland', 'https://www.uef.fi/'],
    ]);
  });

  it('links the calendar feed and the JSON export under the site base', () => {
    render(<AboutPage universities={universities} base="/phdtv/" />);
    expect(screen.getByRole('link', { name: /calendar feed/i }).getAttribute('href')).toBe('/phdtv/feeds/all.ics');
    expect(screen.getByRole('link', { name: /json export/i }).getAttribute('href')).toBe('/phdtv/api/defenses.json');
  });
});
