// app/api/trust-check/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyTrustCheck } from './trust-check';

// The action set on the widget (data-action, or the action prop).
const EXPECTED_ACTION = 'signup';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const result = await verifyTrustCheck(form, {
    remoteip: request.headers.get('x-forwarded-for')?.split(',')[0].trim(),
    action: EXPECTED_ACTION,
  });
  if (!result.ok) {
    const status = result.codes.includes('missing-input-response') ? 400 : 403;
    return NextResponse.json({ error: 'trust_check_failed', codes: result.codes }, { status });
  }

  // The Trust Check passed: do the protected work here, such as creating the
  // account from form.get('email'). Or call verifyTrustCheck from the route or
  // server action that already handles the form, and delete this route.
  return NextResponse.json({ ok: true });
}
