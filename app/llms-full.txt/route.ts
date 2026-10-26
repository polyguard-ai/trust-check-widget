import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Rendered once at build time from public/llms.txt and examples/, so it cannot drift from them.
export const dynamic = 'force-static';

const EXAMPLES: { title: string; file: string; lang: string }[] = [
  { title: 'Plain HTML', file: 'examples/html/index.html', lang: 'html' },
  { title: 'React hook', file: 'examples/react/usePolyguardTrustCheck.ts', lang: 'ts' },
  { title: 'React form', file: 'examples/react/TrustCheckForm.tsx', lang: 'tsx' },
  { title: 'Next.js App Router route handler', file: 'examples/nextjs/route.ts', lang: 'ts' },
  { title: 'Express middleware', file: 'examples/express/middleware.js', lang: 'js' },
  { title: 'Flask decorator', file: 'examples/python-flask/verify.py', lang: 'python' },
  { title: 'PHP', file: 'examples/php/verify.php', lang: 'php' },
  { title: 'WordPress notes', file: 'examples/wordpress/README.md', lang: 'md' },
];

function read(file: string): string {
  return readFileSync(join(process.cwd(), file), 'utf8').trimEnd();
}

/** Moves Markdown headings below `###` so an embedded README nests under its section. */
function demoteHeadings(md: string): string {
  let inFence = false;
  return md
    .split('\n')
    .map((line) => {
      if (line.startsWith('```')) inFence = !inFence;
      return !inFence && /^#{1,4} /.test(line) ? `###${line}` : line;
    })
    .join('\n');
}

function render(): string {
  // The llmstxt.org format keeps "## Optional" last, so the examples go before it.
  const [main, optional] = read('public/llms.txt').split('\n## Optional\n');
  const parts = [main.trimEnd(), '', '## Example source', ''];
  for (const ex of EXAMPLES) {
    const body = read(ex.file);
    parts.push(`### ${ex.title}: \`${ex.file}\``, '');
    parts.push(ex.lang === 'md' ? demoteHeadings(body) : `\`\`\`${ex.lang}\n${body}\n\`\`\``, '');
  }
  if (optional) parts.push('## Optional', optional.trimEnd());
  return parts.join('\n') + '\n';
}

export function GET() {
  return new Response(render(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
