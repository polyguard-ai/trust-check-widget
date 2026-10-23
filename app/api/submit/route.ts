import { NextRequest, NextResponse } from 'next/server';
import { API_SERVER } from '@/lib/config';
import {
  RESPONSE_FIELD,
  RESPONSE_PATTERN,
  type SiteverifyResult,
  clientIp,
  expectedHostnames,
  normalizeHostname,
} from '@/lib/siteverify';

export const dynamic = 'force-dynamic';

const SITEVERIFY_URL = `https://${API_SERVER}/v2/siteverify`;
const TIMEOUT_MS = 5000;

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const response = form.get(RESPONSE_FIELD);
  const expected = expectedHostnames(request.headers.get('host'));

  if (typeof response !== 'string' || !response) {
    return NextResponse.json(
      local(expected, { success: false, 'error-codes': ['missing-input-response'] }),
      { status: 400 },
    );
  }
  if (!RESPONSE_PATTERN.test(response)) {
    return NextResponse.json(
      local(expected, { success: false, 'error-codes': ['invalid-input-response'] }),
      { status: 400 },
    );
  }

  const body = new URLSearchParams({ response });
  const remoteip = clientIp(request.headers);
  if (remoteip) body.set('remoteip', remoteip);
  const secret = process.env.POLYGUARD_SITEVERIFY_SECRET;
  if (secret) body.set('secret', secret);

  let upstream: Response;
  try {
    upstream = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'TimeoutError';
    return NextResponse.json(
      { error: timedOut ? 'siteverify_timeout' : 'siteverify_unreachable', url: SITEVERIFY_URL },
      { status: 502 },
    );
  }

  let siteverify: SiteverifyResult;
  try {
    siteverify = (await upstream.json()) as SiteverifyResult;
  } catch {
    siteverify = { success: false };
  }
  if (!upstream.ok || typeof siteverify?.success !== 'boolean') {
    return NextResponse.json(
      { error: 'siteverify_http_error', status: upstream.status, url: SITEVERIFY_URL },
      { status: 502 },
    );
  }

  const hostnameMatched =
    typeof siteverify.hostname === 'string' &&
    expected.includes(normalizeHostname(siteverify.hostname));

  return NextResponse.json({
    verified: siteverify.success === true && hostnameMatched,
    hostname_matched: hostnameMatched,
    expected_hostname: expected,
    siteverify,
  });
}

function local(expected: string[], siteverify: SiteverifyResult) {
  return { verified: false, hostname_matched: false, expected_hostname: expected, siteverify };
}
