import { z } from 'zod';
import { httpUrl, ianaTimeZone, isoCountry, nonEmptyString, slug } from './common.ts';

/** One institution, stored as `universities/<slug>.yaml`. */
export const universitySchema = z
  .object({
    slug,
    name: nonEmptyString,
    /** Label for badges and chips, e.g. "TU Delft"; the full name is used when absent. */
    short_name: nonEmptyString.optional(),
    country: isoCountry,
    timezone: ianaTimeZone,
    website: httpUrl.optional(),
    agenda_url: httpUrl.optional(),
    aliases: z.array(nonEmptyString).optional(),
  })
  .strict();

export type University = z.infer<typeof universitySchema>;
