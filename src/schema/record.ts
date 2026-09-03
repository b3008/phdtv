import { z } from 'zod';
import { parseOffsetMinutes, zoneOffsetMinutes } from '../lib/time.ts';
import { httpUrl, ianaTimeZone, nonEmptyString, slug } from './common.ts';
import { loadDisciplines } from './disciplines.ts';

const QUOTE_HINT = 'must be a quoted ISO 8601 date-time with a UTC offset, e.g. "2026-09-15T12:30:00+02:00"';
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** ISO 8601 date-time with an explicit UTC offset. Unquoted YAML timestamps become Dates and are rejected. */
export const isoDateTime = z.string({ error: QUOTE_HINT }).regex(ISO_DATE_TIME, { error: QUOTE_HINT, abort: true });

export const isoDate = z
  .string({ error: 'must be a quoted ISO 8601 date, e.g. "2026-09-20"' })
  .regex(ISO_DATE, { error: 'must be a quoted ISO 8601 date, e.g. "2026-09-20"' });

export const platformSchema = z.enum(['youtube', 'vimeo', 'zoom', 'teams', 'university', 'other']);

export const statusSchema = z.enum(['unverified', 'published', 'hidden']);

export const channelSchema = z.enum(['scraped', 'submitted', 'curated']);

/** BCP 47 language tag with a 2-3 letter primary language subtag. */
export const languageTag = z
  .string()
  .regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/, { error: 'must be a BCP 47 language tag such as en or nl-NL', abort: true })
  .refine(
    (tag) => {
      try {
        Intl.getCanonicalLocales(tag);
        return true;
      } catch {
        return false;
      }
    },
    { error: 'must be a BCP 47 language tag such as en or nl-NL' },
  );

const streamSchema = z.object({ url: httpUrl, platform: platformSchema }).strict();

const recordingSchema = z.union([
  z.object({ url: httpUrl, platform: platformSchema, available_from: isoDate.optional() }).strict(),
  z.object({ status: z.literal('none') }).strict(),
]);

const sourceSchema = z
  .object({
    channel: channelSchema,
    url: httpUrl.optional(),
    last_seen: isoDateTime.optional(),
    submitted_at: isoDateTime.optional(),
  })
  .strict();

/** Build the record schema against a discipline vocabulary. */
export function createRecordSchema(disciplineSlugs: Iterable<string>) {
  const slugs = [...disciplineSlugs] as [string, ...string[]];
  const discipline = z.enum(slugs, { error: 'is not a discipline slug from disciplines.yaml' });
  return z
    .object({
      candidate: nonEmptyString,
      title: nonEmptyString,
      university: slug,
      faculty: nonEmptyString.optional(),
      disciplines: z.array(discipline).optional(),
      language: languageTag.optional(),
      starts_at: isoDateTime,
      timezone: ianaTimeZone,
      duration_minutes: z.int().positive().optional(),
      stream: streamSchema.optional(),
      recording: recordingSchema.optional(),
      thesis_url: httpUrl.optional(),
      status: statusSchema,
      source: sourceSchema,
      verified_by: nonEmptyString.optional(),
    })
    .strict()
    .superRefine((record, ctx) => {
      const written = parseOffsetMinutes(record.starts_at);
      const expected = zoneOffsetMinutes(record.timezone, new Date(record.starts_at));
      if (written !== null && written !== expected) {
        ctx.addIssue({
          code: 'custom',
          path: ['starts_at'],
          message: `offset ${formatOffset(written)} does not match ${record.timezone}, which is ${formatOffset(expected)} at that instant`,
        });
      }
      if (record.status === 'published' && !record.verified_by) {
        ctx.addIssue({ code: 'custom', path: ['verified_by'], message: 'is required when status is published' });
      }
      if (record.source.channel === 'scraped' && !record.source.url) {
        ctx.addIssue({ code: 'custom', path: ['source', 'url'], message: 'is required when source.channel is scraped' });
      }
      if (record.source.channel === 'submitted' && !record.source.submitted_at) {
        ctx.addIssue({
          code: 'custom',
          path: ['source', 'submitted_at'],
          message: 'is required when source.channel is submitted',
        });
      }
    });
}

export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `${sign}${hh}:${mm}`;
}

/** The record schema bound to the project's `disciplines.yaml`. */
export const recordSchema = createRecordSchema(loadDisciplines().slugs);

export type DefenseRecord = z.infer<typeof recordSchema>;
export type Platform = z.infer<typeof platformSchema>;
export type RecordStatus = z.infer<typeof statusSchema>;
