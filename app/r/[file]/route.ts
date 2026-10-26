import { REGISTRY_ITEM_NAMES, registryIndex, registryItem } from '@/lib/registry';

// Rendered once at build time from examples/, so the installed files match the examples.
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return ['registry', ...REGISTRY_ITEM_NAMES].map((name) => ({ file: `${name}.json` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const name = file.replace(/\.json$/, '');
  const body = name === 'registry' ? registryIndex() : registryItem(name);
  if (!body) return new Response('Not found', { status: 404 });
  return Response.json(body);
}
