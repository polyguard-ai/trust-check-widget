#!/usr/bin/env tsx
/**
 * Polyguard positioning lint.
 * Scans site copy, examples and docs for forbidden terminology.
 * Run via `pnpm lint:positioning`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

type Rule = { pattern: RegExp; message: string; allow?: string[] };

const ROOT = resolve(__dirname, '..');
const SCAN_DIRS = ['app', 'components', 'lib', 'examples'];
const SCAN_FILES = ['README.md', 'CONTRIBUTING.md'];
const SELF = resolve(__filename);
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.md', '.css', '.html', '.py', '.php']);

const FORBIDDEN: Rule[] = [
  {
    pattern: /\bdetect(ion|s|ing|ed|or|ors)?\b/gi,
    message:
      "Avoid 'detect/detection'. Polyguard verifies, confirms, and prevents. We sell certainty, not signals.",
  },
  {
    pattern: /\bprivacy[- ]first\b/gi,
    message: "Use 'Privacy First' (two words, capitalized). It's an architectural principle.",
    allow: ['Privacy First'],
  },
  {
    pattern: /\bdigital applications?\b/gi,
    message: "Use 'digital transactions', not 'digital applications'.",
  },
  {
    pattern: /\bfour[- ]factor\b/gi,
    message: "Use 'fused identity verification'. 'four-factor' is the deprecated framing.",
  },
  {
    pattern: /\bSecure Line\b/g,
    message: "Use 'Polyguard Mobile', not 'Secure Line'.",
  },
  {
    pattern: /\bPoly(?:[ -][Gg]uard|Guard)\b/g,
    message: "'Polyguard' is one word with a lowercase g.",
  },
  {
    pattern: /\b(?:[Tt]rust check|trust Check)s?\b/g,
    message: "Write 'Trust Check' with both words capitalized.",
  },
  {
    pattern: /\b(?:PG[ _]Presence|PGPresence|Pg-Presence|PG-presence|pg-presence)\b/g,
    message: "Write 'PG-Presence': capital PG, hyphen, capital P.",
  },
  {
    pattern: /—/g,
    message: 'No em-dashes. Use a comma, colon, parentheses or a new sentence.',
  },
  {
    pattern:
      /\b(?:revolutionary|seamless(?:ly)?|cutting[- ]edge|game[- ]chang(?:er|ing)|unparalleled|bulletproof|foolproof|military[- ]grade|unbreakable|best[- ]in[- ]class|world[- ]class)\b/gi,
    message: 'No hyperbole. State what the product does.',
  },
];

const REQUIRED_IN_FILE: Record<string, RegExp[]> = {
  'app/page.tsx': [/Trust Check/, /PG-Presence/],
};

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (EXTENSIONS.has(full.slice(full.lastIndexOf('.')))) files.push(full);
  }
  return files;
}

const files: string[] = SCAN_FILES.map((f) => join(ROOT, f));
for (const sub of SCAN_DIRS) {
  try {
    walk(join(ROOT, sub), files);
  } catch {
    /* directory absent */
  }
}

const errors: string[] = [];

for (const file of files) {
  if (resolve(file) === SELF) continue;
  let content: string;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  for (const rule of FORBIDDEN) {
    const matches = (content.match(rule.pattern) ?? []).filter((m) => !rule.allow?.includes(m));
    if (matches.length) {
      errors.push(
        `${relative(ROOT, file)}: ${rule.message} (found: ${[...new Set(matches)].join(', ')})`,
      );
    }
  }
}

for (const [file, required] of Object.entries(REQUIRED_IN_FILE)) {
  const content = readFileSync(join(ROOT, file), 'utf8');
  for (const r of required) {
    if (!r.test(content)) errors.push(`${file}: must mention ${r.source}.`);
  }
}

if (errors.length) {
  console.error('Positioning lint failed:\n');
  for (const e of errors) console.error('  • ' + e);
  console.error(`\n${errors.length} issue(s).`);
  process.exit(1);
}
console.log('Positioning lint passed.');
