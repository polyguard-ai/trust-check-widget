import type { Metadata } from 'next';
import { MigrationGuide } from '@/components/MigrationGuide';
import { TURNSTILE } from '@/lib/migrations';

export const metadata: Metadata = {
  title: 'Migrate from Turnstile',
  description:
    'Replace Cloudflare Turnstile with a Polyguard Trust Check: the names, markup and server call side by side.',
};

export default function Page() {
  return <MigrationGuide migration={TURNSTILE} />;
}
