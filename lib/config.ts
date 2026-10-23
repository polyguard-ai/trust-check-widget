export const CDN_SCRIPT_URL = 'https://cdn.polyguard.ai/sdk/latest/trust-check.js';

export const API_SERVER = process.env.NEXT_PUBLIC_POLYGUARD_API_SERVER || 'api.polyguard.ai';

export const TRUST_CHECK_SCRIPT_URL =
  process.env.NEXT_PUBLIC_TRUST_CHECK_SCRIPT_URL || CDN_SCRIPT_URL;

export const ONLOAD_CALLBACK = '__pgTrustCheckOnload';

export const REPO_URL = 'https://github.com/polyguard-ai/trust-check-widget';
export const CONSOLE_CLAIM_URL = 'https://console.polyguard.ai/settings?claim=';
export const DOCS_URL = 'https://support.polyguard.ai/sdk/';

export function explicitScriptUrl(url: string = TRUST_CHECK_SCRIPT_URL): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}render=explicit&onload=${ONLOAD_CALLBACK}`;
}
