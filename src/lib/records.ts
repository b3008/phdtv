import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { load } from 'js-yaml';

export interface SourceFile {
  /** Path relative to the project root, always with forward slashes. */
  path: string;
  /** Parsed YAML (frontmatter for records, whole file for registry entries); undefined when unparsable. */
  data: unknown;
  /** Markdown body after the frontmatter (records only). */
  body: string;
  /** Parse error, when the YAML could not be read. */
  error?: string;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/;

/** Parse Markdown with YAML frontmatter the way Astro does (js-yaml default schema). */
export function parseRecordFile(text: string): { data: unknown; body: string; error?: string } {
  const match = FRONTMATTER.exec(text);
  if (!match) return { data: undefined, body: text, error: 'missing frontmatter block' };
  try {
    return { data: load(match[1] ?? '') ?? {}, body: match[2] ?? '' };
  } catch (cause) {
    return { data: undefined, body: match[2] ?? '', error: `invalid YAML: ${(cause as Error).message.split('\n')[0]}` };
  }
}

function walk(dir: string, matches: (name: string) => boolean): string[] {
  let files: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }
  for (const name of entries.sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files = files.concat(walk(full, matches));
    else if (matches(name)) files.push(full);
  }
  return files;
}

const toPosix = (rootDir: string, full: string) => relative(rootDir, full).split(sep).join('/');

/** Every `records/**\/*.md` file under the project root. */
export function loadRecordFiles(rootDir: string): SourceFile[] {
  return walk(join(rootDir, 'records'), (n) => n.endsWith('.md')).map((full) => {
    const parsed = parseRecordFile(readFileSync(full, 'utf8'));
    return { path: toPosix(rootDir, full), ...parsed };
  });
}

/** Every `universities/*.yaml` file under the project root. */
export function loadUniversityFiles(rootDir: string): SourceFile[] {
  return walk(join(rootDir, 'universities'), (n) => n.endsWith('.yaml') || n.endsWith('.yml')).map((full) => {
    const path = toPosix(rootDir, full);
    try {
      return { path, data: load(readFileSync(full, 'utf8')) ?? {}, body: '' };
    } catch (cause) {
      return { path, data: undefined, body: '', error: `invalid YAML: ${(cause as Error).message.split('\n')[0]}` };
    }
  });
}
