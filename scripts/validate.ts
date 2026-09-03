// Validate records/ and universities/: prints `path: rule: message` per finding, exits 1 on any blocking finding.
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { formatFinding, hasBlockingFindings, validateProject } from '../src/validate/index.ts';

const { values } = parseArgs({
  options: {
    root: { type: 'string', default: '.' },
    links: { type: 'boolean', default: true },
    base: { type: 'string' },
    author: { type: 'string' },
  },
  allowNegative: true,
});

const findings = await validateProject({ rootDir: resolve(values.root), checkLinks: values.links });

for (const finding of findings) console.log(formatFinding(finding));

const errors = findings.filter((f) => f.level === 'error').length;
const warnings = findings.length - errors;
console.log(`${errors} error(s), ${warnings} warning(s).`);
process.exit(hasBlockingFindings(findings) ? 1 : 0);
