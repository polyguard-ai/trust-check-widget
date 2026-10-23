import type { DiffRow } from '@/components/DiffTable';

export type Migration = {
  slug: 'recaptcha' | 'turnstile';
  name: string;
  fromLabel: string;
  rows: DiffRow[];
  htmlBefore: string;
  htmlAfter: string;
  serverBefore: string;
  serverAfter: string;
  differences: string[];
};

const HTML_AFTER = `<script src="https://cdn.polyguard.ai/sdk/latest/trust-check.js" async defer></script>

<form method="POST" action="/signup">
  <input name="email" type="email" required>
  <div class="pg-trust-check"
       data-callback="onVerified"
       data-action="signup"></div>
  <button type="submit">Create account</button>
</form>`;

const SERVER_AFTER = `const res = await fetch('https://api.polyguard.ai/v2/siteverify', {
  method: 'POST',
  body: new URLSearchParams({
    response: req.body['pg-trust-check-response'],
    remoteip: req.ip,
  }),
});
const result = await res.json();
if (!result.success || result.hostname !== 'www.example.com') {
  return res.status(403).send('Trust Check failed');
}`;

const SHARED_DIFFERENCES = [
  'No site key or account is needed to start. The first Trust Check from your hostname creates the account.',
  'secret is optional. After you claim the hostname, send the App API key as secret, and require it from the Advanced tab if you want.',
  'remoteip is compared with the address that started the Trust Check and reported as remoteip_matched. It never changes success, because mobile carriers and corporate egress change addresses between the click and the form post.',
  'A result verifies once, within 300 seconds of completion. A second call returns timeout-or-duplicate.',
  'The response adds app_id, link_uuid, link_session_id, action, cdata and score.',
  'Visitors need a phone. They do not need to install an app.',
];

export const RECAPTCHA: Migration = {
  slug: 'recaptcha',
  name: 'reCAPTCHA',
  fromLabel: 'reCAPTCHA v2',
  rows: [
    {
      from: 'https://www.google.com/recaptcha/api.js',
      to: 'https://cdn.polyguard.ai/sdk/latest/trust-check.js',
    },
    { from: 'class="g-recaptcha" data-sitekey="…"', to: 'class="pg-trust-check"' },
    { from: 'g-recaptcha-response', to: 'pg-trust-check-response' },
    {
      from: 'grecaptcha.render/reset/getResponse',
      to: 'Polyguard.TrustCheck.render/reset/getResponse',
    },
    {
      from: 'POST /recaptcha/api/siteverify with secret, response, remoteip',
      to: 'POST /v2/siteverify with response, remoteip',
      note: 'secret optional; remoteip is compared and reported, not enforced',
    },
    { from: 'success, challenge_ts, hostname, error-codes', to: 'same fields' },
  ],
  htmlBefore: `<script src="https://www.google.com/recaptcha/api.js" async defer></script>

<form method="POST" action="/signup">
  <input name="email" type="email" required>
  <div class="g-recaptcha"
       data-sitekey="YOUR_SITE_KEY"
       data-callback="onVerified"></div>
  <button type="submit">Create account</button>
</form>`,
  htmlAfter: HTML_AFTER,
  serverBefore: `const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
  method: 'POST',
  body: new URLSearchParams({
    secret: process.env.RECAPTCHA_SECRET,
    response: req.body['g-recaptcha-response'],
    remoteip: req.ip,
  }),
});
const result = await res.json();
if (!result.success || result.hostname !== 'www.example.com') {
  return res.status(403).send('CAPTCHA failed');
}`,
  serverAfter: SERVER_AFTER,
  differences: [
    ...SHARED_DIFFERENCES,
    'reCAPTCHA tokens last 2 minutes; Trust Check results last 300 seconds.',
    'There is no invisible or score-only mode like reCAPTCHA v3. Every Trust Check is interactive.',
  ],
};

export const TURNSTILE: Migration = {
  slug: 'turnstile',
  name: 'Turnstile',
  fromLabel: 'Cloudflare Turnstile',
  rows: [
    {
      from: 'challenges.cloudflare.com/turnstile/v0/api.js',
      to: 'cdn.polyguard.ai/sdk/latest/trust-check.js',
    },
    { from: 'class="cf-turnstile" data-sitekey', to: 'class="pg-trust-check"' },
    { from: 'cf-turnstile-response', to: 'pg-trust-check-response' },
    {
      from: 'turnstile.render/reset/remove/getResponse/isExpired/execute/ready',
      to: 'same names under Polyguard.TrustCheck',
    },
    {
      from: 'data-action, data-cdata, data-theme, data-size, data-execution',
      to: 'same',
    },
    {
      from: 'data-appearance, managed/non-interactive/invisible modes',
      to: 'not supported; every check is interactive',
    },
    {
      from: '/turnstile/v0/siteverify',
      to: '/v2/siteverify',
      note: 'idempotency_key accepted and ignored in v1',
    },
  ],
  htmlBefore: `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<form method="POST" action="/signup">
  <input name="email" type="email" required>
  <div class="cf-turnstile"
       data-sitekey="YOUR_SITE_KEY"
       data-callback="onVerified"
       data-action="signup"></div>
  <button type="submit">Create account</button>
</form>`,
  htmlAfter: HTML_AFTER,
  serverBefore: `const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  method: 'POST',
  body: new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET,
    response: req.body['cf-turnstile-response'],
    remoteip: req.ip,
  }),
});
const result = await res.json();
if (!result.success || result.hostname !== 'www.example.com') {
  return res.status(403).send('CAPTCHA failed');
}`,
  serverAfter: SERVER_AFTER,
  differences: [
    ...SHARED_DIFFERENCES,
    'Sizes match Turnstile: normal (300×65), compact (150×140) and flexible (full width, 65 tall).',
  ],
};
