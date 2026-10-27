// app/api/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SITEVERIFY_URL = 'https://api.polyguard.ai/v2/siteverify';
// The hostname your form is served from, exactly as visitors load it.
const EXPECTED_HOSTNAME = process.env.SITE_HOSTNAME ?? 'www.example.com';

type Siteverify = {
  success: boolean;
  hostname?: string;
  action?: string;
  score?: string;
  'error-codes'?: string[];
};

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const token = form.get('pg-trust-check-response');
  if (typeof token !== 'string' || !token) {
    return NextResponse.json({ error: 'missing-input-response' }, { status: 400 });
  }

  const body = new URLSearchParams({ response: token });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim();
  if (ip) body.set('remoteip', ip);
  // Optional until your hostname is claimed: the App API key from the console.
  if (process.env.POLYGUARD_SITEVERIFY_SECRET) {
    body.set('secret', process.env.POLYGUARD_SITEVERIFY_SECRET);
  }

  const res = await fetch(SITEVERIFY_URL, {
    method: 'POST',
    body,
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  const result = (await res.json()) as Siteverify;

  // Without a secret, the hostname comparison is what ties the result to your site.
  if (!result.success || result.hostname !== EXPECTED_HOSTNAME || result.action !== 'signup') {
    return NextResponse.json(
      { error: 'trust_check_failed', codes: result['error-codes'] ?? [] },
      { status: 403 },
    );
  }

  // The check passed: create the account with form.get('email').
  return NextResponse.json({ ok: true });
}
