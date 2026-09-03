// Generate schema/*.schema.json from the Zod schemas, or verify they are current with --check.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { renderJsonSchemas } from '../src/schema/json-schema.ts';

const { values } = parseArgs({
  options: {
    check: { type: 'boolean', default: false },
    dir: { type: 'string', default: 'schema' },
  },
});

const dir = resolve(values.dir);
const files = renderJsonSchemas();

if (values.check) {
  const stale = Object.entries(files)
    .filter(([name, content]) => !existsSync(join(dir, name)) || readFileSync(join(dir, name), 'utf8') !== content)
    .map(([name]) => name);
  if (stale.length > 0) {
    console.error(`Stale JSON Schema: ${stale.join(', ')}. Run "npm run schema" and commit the result.`);
    process.exit(1);
  }
  console.log(`JSON Schema files in ${dir} are up to date.`);
} else {
  mkdirSync(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  console.log(`Wrote ${Object.keys(files).join(', ')} to ${dir}.`);
}
