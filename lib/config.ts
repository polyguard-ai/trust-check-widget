export const CDN_SCRIPT_URL = 'https://cdn.polyguard.ai/sdk/latest/trust-check.js';

export const API_SERVER = process.env.NEXT_PUBLIC_POLYGUARD_API_SERVER || 'api.polyguard.ai';

export const TRUST_CHECK_SCRIPT_URL =
  process.env.NEXT_PUBLIC_TRUST_CHECK_SCRIPT_URL || CDN_SCRIPT_URL;

export const ONLOAD_CALLBACK = '__pgTrustCheckOnload';

export const REPO_URL = 'https://github.com/polyguard-ai/trust-check-widget';
export const CONSOLE_CLAIM_URL = 'https://console.polyguard.ai/settings?claim=';
export const DOCS_URL = 'https://support.polyguard.ai/sdk/';
export const LLMS_TXT_URL = 'https://postcaptcha.com/llms.txt';

export const AGENT_PROMPT = `Replace the CAPTCHA on my form with a Polyguard Trust Check. Read ${LLMS_TXT_URL} and follow it for my stack: add the script tag and the pg-trust-check div to the form, keep the submit button disabled until the widget's callback fires, and verify pg-trust-check-response on the server with POST https://api.polyguard.ai/v2/siteverify, requiring success to be true and hostname to equal my site's hostname.`;

export function explicitScriptUrl(url: string = TRUST_CHECK_SCRIPT_URL): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}render=explicit&onload=${ONLOAD_CALLBACK}`;
}
