import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { REGISTRY_URL, SITE_URL } from './config';

type ItemFile = {
  /** Repository file the content is read from. */
  source: string;
  path: string;
  type: string;
  target?: string;
  /** Exact import rewrites applied to the source; each must match. */
  rewrite?: [string, string][];
};

type Item = {
  name: string;
  type: string;
  title: string;
  description: string;
  docs: string;
  files: ItemFile[];
};

// File paths under `components/` and `lib/` let the shadcn CLI place them with the project's aliases.
const ITEMS: Item[] = [
  {
    name: 'trust-check',
    type: 'registry:component',
    title: 'Polyguard Trust Check',
    description:
      'A keyless CAPTCHA replacement: a TrustCheck component and the usePolyguardTrustCheck hook. Place it inside a form; the server verifies pg-trust-check-response with POST https://api.polyguard.ai/v2/siteverify.',
    docs: `Verify pg-trust-check-response on the server before accepting the form. Next.js App Router: npx shadcn@latest add ${REGISTRY_URL}/trust-check-verify.json. Other stacks: ${SITE_URL}/llms.txt`,
    files: [
      {
        source: 'examples/react/TrustCheck.tsx',
        path: 'registry/components/trust-check/TrustCheck.tsx',
        type: 'registry:component',
      },
      {
        source: 'examples/react/usePolyguardTrustCheck.ts',
        path: 'registry/components/trust-check/usePolyguardTrustCheck.ts',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'trust-check-verify',
    type: 'registry:item',
    title: 'Polyguard Trust Check verifier for Next.js',
    description:
      'verifyTrustCheck() for route handlers and server actions, and an App Router route at app/api/trust-check/verify that uses it. Requires success, the expected hostname and the action.',
    docs: 'Set SITE_HOSTNAME to the hostname your form is served from (comma-separate several). Set EXPECTED_ACTION in the route to the action on the widget. POLYGUARD_SITEVERIFY_SECRET is optional until the hostname is claimed.',
    files: [
      {
        source: 'examples/nextjs/trust-check.ts',
        path: 'registry/lib/trust-check.ts',
        type: 'registry:lib',
      },
      {
        source: 'examples/nextjs/route.ts',
        path: 'registry/app/api/trust-check/verify/route.ts',
        type: 'registry:file',
        target: 'app/api/trust-check/verify/route.ts',
        rewrite: [["from './trust-check'", "from '@/lib/trust-check'"]],
      },
    ],
  },
];

export const REGISTRY_ITEM_NAMES = ITEMS.map((item) => item.name);

function fileContent(file: ItemFile): string {
  let content = readFileSync(join(process.cwd(), file.source), 'utf8');
  for (const [from, to] of file.rewrite ?? []) {
    if (!content.includes(from)) throw new Error(`${file.source} no longer contains ${from}`);
    content = content.replace(from, to);
  }
  return content;
}

function fileEntry({ path, type, target }: ItemFile) {
  return target ? { path, type, target } : { path, type };
}

export function registryIndex() {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'postcaptcha',
    homepage: SITE_URL,
    items: ITEMS.map(({ files, ...item }) => ({ ...item, files: files.map(fileEntry) })),
  };
}

export function registryItem(name: string) {
  const item = ITEMS.find((i) => i.name === name);
  if (!item) return null;
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    ...item,
    files: item.files.map((file) => ({ ...fileEntry(file), content: fileContent(file) })),
  };
}
