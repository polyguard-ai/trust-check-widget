import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { TrustCheckForm } from '@/components/TrustCheckForm';

export const metadata: Metadata = {
  title: 'Demo',
  description:
    'A contact form gated by a keyless Polyguard Trust Check, verified on the server with /v2/siteverify.',
};

const HANDLER = `// app/api/submit/route.ts (abridged)
const response = form.get('pg-trust-check-response');
const body = new URLSearchParams({ response, remoteip });
if (process.env.POLYGUARD_SITEVERIFY_SECRET) body.set('secret', ...);

const siteverify = await fetch('https://api.polyguard.ai/v2/siteverify', {
  method: 'POST', body,
}).then((r) => r.json());

const verified = siteverify.success && siteverify.hostname === requestHost;
return Response.json({ verified, hostname_matched, siteverify });`;

const STEPS = [
  'The page script renders the widget and keeps Send disabled.',
  'You click the box. The widget requests this page’s link from the Polyguard API, then displays a code for you to scan with your phone.',
  'You complete the Trust Check on your phone. The widget writes the result to a hidden pg-trust-check-response input and calls its callback, which enables Send.',
  'Clicking Send posts the form to /api/submit on this site. The handler calls /v2/siteverify, compares the returned hostname with the hostname of this page, and returns the response.',
  'Polyguard accepts each result once. The widget resets after Send, so a second message needs a new Trust Check.',
];

export default function DemoPage() {
  return (
    <div className="bg-surface px-4 py-14 sm:px-6">
      <div className="mx-auto flex max-w-[1120px] flex-wrap gap-12">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-5">
          <h1 className="m-0 text-4xl leading-tight font-bold tracking-[-0.01em]">
            A contact form gated by a Trust Check
          </h1>
          <p className="m-0 text-lg leading-normal text-muted">
            This form uses keyless mode against the production API: no site key, no account, no
            secret. Nothing you type is stored. The server verifies the Trust Check and returns the
            result.
          </p>
          <ol className="m-0 flex list-decimal flex-col gap-2 pl-5 text-[15px] leading-relaxed text-muted">
            {STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <CodeBlock code={HANDLER} lang="ts" small />
          <p className="m-0 text-sm text-muted">
            The full handler is <span className="font-mono">app/api/submit/route.ts</span> in{' '}
            <a href="https://github.com/polyguard-ai/trust-check-widget">the repo</a>. To move from
            another CAPTCHA, see the <Link href="/migrate/recaptcha">reCAPTCHA</Link> and{' '}
            <Link href="/migrate/turnstile">Turnstile</Link> guides.
          </p>
        </div>
        <div className="min-w-0 flex-[0_1_420px]">
          <TrustCheckForm id="contact" />
        </div>
      </div>
    </div>
  );
}
