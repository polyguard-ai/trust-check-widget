# postcaptcha

postcaptcha replaces reCAPTCHA or Cloudflare Turnstile. The visitor confirms
with their phone, Polyguard checks with PG-Presence that a real device is in
front of the screen, and your server verifies the result with one POST. No site key, secret or account is needed to start.

This repo is the source of [postcaptcha.com](https://postcaptcha.com): a
single page with the widget live, a setup prompt for coding agents,
`/llms.txt` for the agents themselves, the reCAPTCHA and Turnstile migration
tables, the claim instructions, and server-side verification examples you
can copy.

## For coding agents

- [`postcaptcha.com/llms.txt`](https://postcaptcha.com/llms.txt): when to add
  postcaptcha, the markup, the siteverify contract and the rules to enforce.
- [`postcaptcha.com/llms-full.txt`](https://postcaptcha.com/llms-full.txt):
  the same with every example's source inline, built from `examples/`.
- [`skills/postcaptcha`](./skills/postcaptcha/SKILL.md): an Agent Skill.
  Install it with `npx skills add polyguard-ai/trust-check-widget`, or copy
  the directory into `.claude/skills/` or your agent's skills directory.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpolyguard-ai%2Ftrust-check-widget&project-name=trust-check-widget)

No environment variables are required to deploy.

---

## Add it to your site

```html
<script src="https://cdn.polyguard.ai/sdk/latest/trust-check.js" async defer></script>

<form method="POST" action="/signup">
  <input name="email" type="email" required>
  <div class="pg-trust-check" data-callback="onVerified" data-action="signup"></div>
  <button type="submit">Create account</button>
</form>
```

On success the widget adds a hidden `pg-trust-check-response` input to the
form. Your server sends it to `/v2/siteverify` and compares `hostname` with its
own:

```http
POST https://api.polyguard.ai/v2/siteverify
Content-Type: application/x-www-form-urlencoded

response=<pg-trust-check-response>&remoteip=203.0.113.9
```

```json
{
  "success": true,
  "challenge_ts": "2026-10-22T18:40:12Z",
  "hostname": "www.example.com",
  "app_id": "sdk-www-example-com-7f3a",
  "link_uuid": "…",
  "link_session_id": "…",
  "action": "signup",
  "cdata": "",
  "score": "PASS",
  "remoteip_matched": true,
  "error-codes": []
}
```

Polyguard accepts each result once, within 300 seconds. `secret` is optional until you
claim the hostname. Working versions for plain HTML, React, Next.js, Express,
Flask, PHP and WordPress are in [`examples/`](./examples).

Visitors need a phone. They do not need to install an app: on an iPhone the
check runs in an App Clip, and on Android it runs in the browser.

### Replacing reCAPTCHA, Turnstile or hCaptcha

For reCAPTCHA v2 and Turnstile, change the script URL to
`https://cdn.polyguard.ai/sdk/latest/trust-check.js` and the server's
siteverify URL to `https://api.polyguard.ai/v2/siteverify`. The script renders
existing `.g-recaptcha` and `.cf-turnstile` markup and keeps their field
names. For hCaptcha, also change the container class to `pg-trust-check` and
read `pg-trust-check-response` on the server. See
[the migration tables](https://postcaptcha.com/#migrate).

---

## Quick start (local)

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000. The widget loads from the CDN by default.

### Using an unreleased widget build

Until the SDK release that publishes `trust-check.js` to the CDN, build it from
the web-sdk branch:

```bash
pnpm fetch-widget
```

The script clones `polyguard-ai/web-sdk` (branch `claude/trust-check-widget-1afe1d`,
override with `SDK_REF`, or point `SDK_DIR` at an existing checkout), runs
`npm ci && npm run build` in `polyguard-sdk/`, and copies
`dist/trust-check.js` to `public/vendor/trust-check.js`, which is gitignored.
Cloning needs access to the web-sdk repository. Then set, in `.env.local`:

```bash
NEXT_PUBLIC_TRUST_CHECK_SCRIPT_URL=/vendor/trust-check.js
```

and restart `pnpm dev`. On `localhost` the backend uses its local development
app, limited to 100 checks a day per IP address.

---

## Environment variables

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_POLYGUARD_API_SERVER` | Browser + server | `api.polyguard.ai` | API host, without a scheme. The widget and `/api/submit` both use `https://<host>`. |
| `NEXT_PUBLIC_TRUST_CHECK_SCRIPT_URL` | Browser | `https://cdn.polyguard.ai/sdk/latest/trust-check.js` | Where the widget script loads from. `/vendor/trust-check.js` for a local build. |
| `POLYGUARD_SITEVERIFY_SECRET` | **Server only** | empty | After the hostname is claimed, the App API key, sent as `secret` to `/v2/siteverify`. |
| `POLYGUARD_EXPECTED_HOSTNAMES` | Server | empty | Comma-separated hostnames `/api/submit` accepts in the result. Empty means the request's own hostname. |

`NEXT_PUBLIC_*` values are inlined at build time; redeploy after changing them.

---

## The claim file

`public/.well-known/polyguard.json` is this site's own claim file, served at
`https://postcaptcha.com/.well-known/polyguard.json`:

```json
{
  "site_verification": {
    "postcaptcha.com": "REPLACE_WITH_CLAIM_TOKEN"
  }
}
```

The site uses keyless mode, so Polyguard creates an account for
`postcaptcha.com` when the first check runs in production. To move that
account into the Polyguard account:

1. Sign in to the console and open **Settings → Websites**
   (`https://console.polyguard.ai/settings?claim=postcaptcha.com`). Start the
   claim; the console shows a token starting `pgsv_`.
2. Replace `REPLACE_WITH_CLAIM_TOKEN` with that token, commit, and deploy.
3. Click **Verify** in the console. The token can stay in the file afterwards.

If the site is also served on another hostname (for example
`www.postcaptcha.com` without a redirect), add a second key with its own token.
See [the claim section](https://postcaptcha.com/#claim) for the file rules.

---

## Scripts

```bash
pnpm dev               # Next.js dev server
pnpm build             # Production build
pnpm start             # Production server
pnpm typecheck         # tsc --noEmit
pnpm lint              # eslint
pnpm lint:positioning  # Polyguard terminology rules (lib/positioning-lint.ts)
pnpm test:e2e          # Playwright smoke test; run pnpm build first
pnpm fetch-widget      # Build trust-check.js from web-sdk into public/vendor/
```

The CI workflow (`.github/workflows/ci.yml`) runs typecheck, lint, positioning lint, build
and the smoke test on every push to `main` and every pull request.

---

## Repo layout

- `app/`: the one page, and `api/submit/route.ts`, the hero's siteverify handler. No database; nothing is stored. `/demo`, `/claim` and `/migrate/*` redirect to the page's sections.
- `components/`: the hero widget, the flow diagram, the copy-prompt button, the claim link form, the diff table.
- `public/llms.txt`: integration instructions for coding agents, linked from the page and from the setup prompt.
- `app/llms-full.txt/route.ts`: `/llms-full.txt`, built at build time from `public/llms.txt` and `examples/`.
- `app/robots.ts`, `app/sitemap.ts`, and the JSON-LD in `app/page.tsx`: crawler and search metadata.
- `skills/postcaptcha/SKILL.md`: an Agent Skill with the same instructions in short form.
- `examples/`: copyable verification code, linked from the page.
- `lib/`: config (including the agent prompt), siteverify helpers, migration tables, positioning lint.
- `scripts/fetch-widget.sh`: local widget build.
- `tests/`: Playwright smoke test, with the widget script and `/api/submit` mocked.

---

## License

MIT. See [LICENSE](./LICENSE).
