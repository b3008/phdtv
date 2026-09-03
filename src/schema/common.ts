import { z } from 'zod';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slug = z.string().regex(SLUG_PATTERN, { error: 'must be a lower-case kebab-case slug' });

export const nonEmptyString = z.string().trim().min(1, { error: 'must not be empty' });

export const httpUrl = z.url({ protocol: /^https?$/, error: 'must be an http(s) URL' });

const regionNames = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'code' });

/** ISO 3166-1 alpha-2 country code that the runtime recognises as a region. */
export const isoCountry = z
  .string()
  .regex(/^[A-Z]{2}$/, { error: 'must be an ISO 3166-1 alpha-2 code such as NL', abort: true })
  .refine((code) => regionNames.of(code) !== code, { error: 'is not an assigned ISO 3166-1 alpha-2 code' });

export function isIanaTimeZone(name: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: name });
    return true;
  } catch {
    return false;
  }
}

/** IANA time zone name such as Europe/Amsterdam. */
export const ianaTimeZone = z
  .string()
  .refine(isIanaTimeZone, { error: 'must be an IANA time zone name such as Europe/Amsterdam' });
