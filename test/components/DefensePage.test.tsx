// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DefensePage } from '../../src/components/DefensePage.tsx';
import { fixtureDefense } from '../fixtures/defenses.ts';

describe('DefensePage', () => {
  it('renders every present field of a defense', () => {
    render(<DefensePage defense={fixtureDefense()} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Learning to schedule under uncertainty' })).toBeTruthy();
    expect(screen.getByText('Jane Doe')).toBeTruthy();
    const institution = screen.getByRole('link', { name: 'Delft University of Technology' });
    expect(institution.getAttribute('href')).toBe('https://www.tudelft.nl/');
    expect(screen.getByText('Netherlands')).toBeTruthy();
    expect(screen.getByText('Electrical Engineering, Mathematics and Computer Science')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Computer and information sciences' })).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText(/Tue 15 Sep 2026/)).toBeTruthy();
    expect(screen.getByText(/12:30/)).toBeTruthy();
    expect(screen.getByText(/CEST/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Watch the livestream' }).getAttribute('href')).toBe('https://collegerama.tudelft.nl/live/1');
    expect(screen.getByRole('link', { name: 'Read the thesis' }).getAttribute('href')).toBe('https://repository.tudelft.nl/record/1');
    expect(screen.getByText('We study scheduling when the future is unknown.')).toBeTruthy();
  });

  it('attributes a listing to the institution agenda when the source has a url', () => {
    render(<DefensePage defense={fixtureDefense()} />);
    const attribution = screen.getByRole('link', { name: /Delft University of Technology agenda/ });
    expect(attribution.getAttribute('href')).toBe('https://www.tudelft.nl/en/events/2026/phd-defence-jane-doe');
  });

  it('says how a listing arrived when there is no source url', () => {
    render(<DefensePage defense={fixtureDefense({ source: { channel: 'submitted' } })} />);
    expect(screen.getByText(/Submitted to PhD TV/)).toBeTruthy();
  });

  it('shows a recording link and skips absent optional fields', () => {
    const { faculty: _f, language: _l, thesisUrl: _t, abstract: _a, stream: _s, ...rest } = fixtureDefense();
    render(<DefensePage defense={{ ...rest, recording: { url: 'https://youtu.be/rec', platform: 'youtube' } }} />);
    expect(screen.getByRole('link', { name: 'Watch the recording' }).getAttribute('href')).toBe('https://youtu.be/rec');
    expect(screen.queryByRole('link', { name: 'Read the thesis' })).toBeNull();
    expect(screen.queryByText('English')).toBeNull();
  });
});
