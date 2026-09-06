import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildJsonSchemas } from '../../src/schema/json-schema.ts';

describe('buildJsonSchemas', () => {
  const { record, university } = buildJsonSchemas();

  it('emits draft-07 documents that forbid unknown keys', () => {
    expect(record['$schema']).toBe('http://json-schema.org/draft-07/schema#');
    expect(record['additionalProperties']).toBe(false);
    expect(university['additionalProperties']).toBe(false);
  });

  it('lists the required record fields', () => {
    expect(record['required']).toEqual(
      expect.arrayContaining(['candidate', 'title', 'university', 'starts_at', 'timezone', 'status', 'source']),
    );
    expect(record['required']).not.toContain('verified_by');
  });

  it('enumerates the discipline vocabulary for editor completion', () => {
    const disciplines = (record['properties'] as Record<string, Record<string, unknown>>)['disciplines'];
    const items = disciplines?.['items'] as Record<string, unknown>;
    expect(items['enum']).toContain('mathematics');
  });

  it('describes the optional centerfold block as a closed object', () => {
    const centerfold = (record['properties'] as Record<string, Record<string, unknown>>)['centerfold'];
    expect(centerfold?.['type']).toBe('object');
    expect(centerfold?.['additionalProperties']).toBe(false);
    expect(record['required']).not.toContain('centerfold');
  });

  it('lists the required university fields', () => {
    expect(university['required']).toEqual(expect.arrayContaining(['slug', 'name', 'country', 'timezone']));
  });
});

describe('scripts/schema.ts', () => {
  const run = (args: string[]) =>
    execFileSync('node', ['scripts/schema.ts', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

  it('writes both files, then passes --check, then fails --check after a hand edit', () => {
    const dir = mkdtempSync(join(tmpdir(), 'phdtv-schema-'));
    run(['--dir', dir]);
    const recordPath = join(dir, 'record.schema.json');
    expect(JSON.parse(readFileSync(recordPath, 'utf8'))['$schema']).toContain('draft-07');
    expect(() => run(['--check', '--dir', dir])).not.toThrow();

    writeFileSync(recordPath, readFileSync(recordPath, 'utf8').replace('"candidate"', '"candidate_name"'));
    expect(() => run(['--check', '--dir', dir])).toThrow(/record\.schema\.json/);
  });
});
