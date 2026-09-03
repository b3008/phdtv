import type { Platform } from '../schema/record.ts';

const regions = new Intl.DisplayNames(['en'], { type: 'region' });
const languages = new Intl.DisplayNames(['en'], { type: 'language' });

export function countryName(code: string): string {
  try {
    return regions.of(code) ?? code;
  } catch {
    return code;
  }
}

export function languageName(tag: string): string {
  try {
    return languages.of(tag) ?? tag;
  } catch {
    return tag;
  }
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  zoom: 'Zoom',
  teams: 'Microsoft Teams',
  university: 'university player',
  other: 'external site',
};
