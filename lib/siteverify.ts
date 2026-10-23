export type SiteverifyResult = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  app_id?: string;
  link_uuid?: string;
  link_session_id?: string;
  action?: string;
  cdata?: string;
  score?: string;
  remoteip_matched?: boolean;
  'error-codes'?: string[];
};

export const RESPONSE_FIELD = 'pg-trust-check-response';
export const RESPONSE_PATTERN = /^[A-Za-z0-9]{8,32}$/;

/** Lowercase, trailing dot and port stripped, as the backend normalizes. */
export function normalizeHostname(value: string): string {
  let host = value.trim().toLowerCase();
  if (host.startsWith('[')) {
    const end = host.indexOf(']');
    host = end === -1 ? host : host.slice(0, end + 1);
  } else {
    host = host.split(':')[0];
  }
  return host.replace(/\.$/, '');
}

export function clientIp(headers: Headers): string | undefined {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return headers.get('x-real-ip')?.trim() || undefined;
}

export function expectedHostnames(requestHost: string | null): string[] {
  const configured = (process.env.POLYGUARD_EXPECTED_HOSTNAMES ?? '')
    .split(',')
    .map((h) => normalizeHostname(h))
    .filter(Boolean);
  if (configured.length) return configured;
  return requestHost ? [normalizeHostname(requestHost)] : [];
}
