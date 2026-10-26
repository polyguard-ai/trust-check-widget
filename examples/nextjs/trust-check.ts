// lib/trust-check.ts (server only)
const SITEVERIFY_URL = 'https://api.polyguard.ai/v2/siteverify';
// The hostnames your form is served from, exactly as visitors load them, comma-separated.
const EXPECTED_HOSTNAMES = (process.env.SITE_HOSTNAME ?? 'www.example.com')
  .split(',')
  .map((h) => h.trim());

export type Siteverify = {
  success: boolean;
  hostname?: string;
  action?: string;
  score?: string;
  'error-codes'?: string[];
};

export type TrustCheckResult =
  { ok: true; siteverify: Siteverify } | { ok: false; codes: string[] };

/**
 * Sends a pg-trust-check-response (the form, or the value itself) to Polyguard.
 * `ok` is true only if siteverify reports success for one of your hostnames
 * and, when `action` is given, for that action.
 */
export async function verifyTrustCheck(
  input: FormData | string,
  { remoteip, action }: { remoteip?: string | null; action?: string } = {},
): Promise<TrustCheckResult> {
  const token = typeof input === 'string' ? input : input.get('pg-trust-check-response');
  if (typeof token !== 'string' || !token) return { ok: false, codes: ['missing-input-response'] };

  const body = new URLSearchParams({ response: token });
  if (remoteip) body.set('remoteip', remoteip);
  // Optional until your hostname is claimed: the App API key from the console.
  if (process.env.POLYGUARD_SITEVERIFY_SECRET) {
    body.set('secret', process.env.POLYGUARD_SITEVERIFY_SECRET);
  }

  let result: Siteverify;
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    result = (await res.json()) as Siteverify;
  } catch {
    return { ok: false, codes: ['siteverify-unavailable'] };
  }

  if (!result.success) return { ok: false, codes: result['error-codes'] ?? [] };
  // Without a secret, the hostname comparison is what ties the result to your site.
  if (!result.hostname || !EXPECTED_HOSTNAMES.includes(result.hostname)) {
    return { ok: false, codes: ['hostname-mismatch'] };
  }
  if (action && result.action !== action) return { ok: false, codes: ['action-mismatch'] };
  return { ok: true, siteverify: result };
}
