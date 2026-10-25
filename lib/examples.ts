import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_URL } from './config';
import type { Lang } from './highlight';

export type Example = { label: string; path: string; lang: Lang; note?: string };

export const EXAMPLES: Example[] = [
  {
    label: 'React',
    path: 'examples/react/TrustCheckForm.tsx',
    lang: 'tsx',
    note: 'The hook is in examples/react/usePolyguardTrustCheck.ts.',
  },
  { label: 'Next.js', path: 'examples/nextjs/route.ts', lang: 'ts' },
  { label: 'Express', path: 'examples/express/middleware.js', lang: 'js' },
  { label: 'HTML', path: 'examples/html/index.html', lang: 'html' },
  { label: 'Flask', path: 'examples/python-flask/verify.py', lang: 'python' },
  { label: 'PHP', path: 'examples/php/verify.php', lang: 'php' },
];

export function readExample(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

export function exampleUrl(path: string): string {
  return `${REPO_URL}/blob/main/${path}`;
}
