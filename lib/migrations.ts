export type MigrationStep = { text: string; from?: string; to?: string };

export type Migration = {
  name: string;
  fromLabel: string;
  required: MigrationStep[];
  optional: MigrationStep[];
};

/** Ordered by weight: what changes behavior first, then setup, then details. */
export const DIFFERENCES = [
  'There is no invisible or score-only mode. Every Trust Check is interactive: the visitor holds a phone up to the screen.',
  'No site key or account is needed. Polyguard creates a free account when the first Trust Check runs from your website.',
  '`secret` is an optional parameter, since API keys cannot be created until you have set up a free account. You can make it required once that is done.',
  'Results are valid for 5 minutes, instead of 2 minutes for reCAPTCHA.',
  '`remoteip` is reported as `remoteip_matched`; decide for yourself whether to fail on a mismatch. Turnstile fails on it.',
];

export const RECAPTCHA: Migration = {
  name: 'reCAPTCHA',
  fromLabel: 'reCAPTCHA v2',
  required: [
    {
      text: 'Replace the script URL.',
      from: 'https://www.google.com/recaptcha/api.js',
      to: 'https://cdn.polyguard.ai/sdk/latest/trust-check.js',
    },
    {
      text: 'Replace the siteverify URL in your server-side call. The request and response fields are the same.',
      from: 'https://www.google.com/recaptcha/api/siteverify',
      to: 'https://api.polyguard.ai/v2/siteverify',
    },
  ],
  optional: [
    {
      text: 'Rename the container class and drop `data-sitekey`. The script also renders `.g-recaptcha` and ignores the key.',
      from: 'class="g-recaptcha" data-sitekey="…"',
      to: 'class="pg-trust-check"',
    },
    {
      text: 'Read the new hidden field name. A `.g-recaptcha` container keeps `g-recaptcha-response`.',
      from: 'g-recaptcha-response',
      to: 'pg-trust-check-response',
    },
    {
      text: 'Call the new global. `window.grecaptcha` is defined with `render`, `reset`, `getResponse` and `ready` when your page has not defined it.',
      from: 'grecaptcha.render / reset / getResponse / ready',
      to: 'Polyguard.TrustCheck.render / reset / getResponse / ready',
    },
  ],
};

export const TURNSTILE: Migration = {
  name: 'Turnstile',
  fromLabel: 'Cloudflare Turnstile',
  required: [
    {
      text: 'Replace the script URL.',
      from: 'https://challenges.cloudflare.com/turnstile/v0/api.js',
      to: 'https://cdn.polyguard.ai/sdk/latest/trust-check.js',
    },
    {
      text: 'Replace the siteverify URL in your server-side call. The request and response fields are the same; `idempotency_key` is ignored.',
      from: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      to: 'https://api.polyguard.ai/v2/siteverify',
    },
    {
      text: 'Remove `data-appearance` and any managed, non-interactive or invisible mode.',
    },
  ],
  optional: [
    {
      text: 'Rename the container class and drop `data-sitekey`. The script also renders `.cf-turnstile` and ignores the key.',
      from: 'class="cf-turnstile" data-sitekey="…"',
      to: 'class="pg-trust-check"',
    },
    {
      text: 'Read the new hidden field name. A `.cf-turnstile` container keeps `cf-turnstile-response`, and `data-response-field-name` overrides it.',
      from: 'cf-turnstile-response',
      to: 'pg-trust-check-response',
    },
    {
      text: 'Call the new global. `window.turnstile` is defined with the same methods when your page has not defined it.',
      from: 'turnstile.render / reset / remove / getResponse / isExpired / execute / ready',
      to: 'Polyguard.TrustCheck.render / reset / remove / getResponse / isExpired / execute / ready',
    },
  ],
};
