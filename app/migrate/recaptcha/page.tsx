import type { Metadata } from 'next';
import { MigrationGuide } from '@/components/MigrationGuide';
import { RECAPTCHA } from '@/lib/migrations';

export const metadata: Metadata = {
  title: 'Migrate from reCAPTCHA v2',
  description:
    'Replace reCAPTCHA v2 with a Polyguard Trust Check: the names, markup and server call side by side.',
};

export default function Page() {
  return <MigrationGuide migration={RECAPTCHA} />;
}
