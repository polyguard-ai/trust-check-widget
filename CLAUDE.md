# CLAUDE.md

Orientation for agents working in this repo.

## What this is

The public `polyguard-ai/trust-check-widget` repo and the postcaptcha.com
mini-site: a keyless Polyguard Trust Check as a drop-in replacement for
reCAPTCHA v2 and Turnstile. Next.js 15 App Router, React 19, Tailwind v4,
pnpm. Spec: `_SPECS/trust-check-widget.md` in the Polyguard workspace
(sections 4 and 8).

## How the widget is wired

- `app/layout.tsx` loads `NEXT_PUBLIC_TRUST_CHECK_SCRIPT_URL` once, with
  `?render=explicit&onload=__pgTrustCheckOnload`. An inline script before it
  defines that callback, which flushes `window.__pgTrustCheckQueue`.
- `components/HeroTrustCheck.tsx` queues its `Polyguard.TrustCheck.render()`
  call on that queue (`lib/trust-check-loader.ts`), so it works whether the
  script loads before or after hydration. When the callback fires it posts
  the response to `/api/submit` and shows the JSON; "Run another check"
  resets the widget because a response verifies once.
- Explicit mode is deliberate: implicit rendering would race React for the
  `.pg-trust-check` element.
- The widget source is `polyguard-sdk/src/trustCheckWidget.js` in
  `polyguard-ai/web-sdk`. Its `apiServer` option is a host; the SDK always
  prefixes `https://`, and `/api/submit` does the same.

## Server side

`app/api/submit/route.ts` posts `response`, `remoteip` and the optional
`secret` to `/v2/siteverify`, compares `hostname` with
`POLYGUARD_EXPECTED_HOSTNAMES` or the request's `Host`, and returns
`{verified, hostname_matched, expected_hostname, siteverify}`. Nothing is
stored. Until the backend's siteverify is deployed it returns 502
`siteverify_http_error` with status 404.

## One page

Everything is on `app/page.tsx` under anchored sections (`#how`,
`#examples`, `#migrate`, `#claim`, plus `#demo` on the hero card); the header
links are anchors. `/demo`, `/claim` and `/migrate/*` redirect there in
`next.config.mjs`. `public/llms.txt` is the agent-facing copy of the
integration instructions and is linked from `AGENT_PROMPT` in
`lib/config.ts`; keep the two in step with `examples/`. The TypeScript
examples are typechecked and linted with the site.

## Commands

```bash
pnpm dev | build | typecheck | lint | lint:positioning
pnpm build && pnpm test:e2e   # Playwright against `next start` on :3200
pnpm fetch-widget             # local trust-check.js into public/vendor/
```

The smoke test intercepts any `trust-check.js` request with a fake widget, so
it does not depend on the CDN or a local build.

## Gotchas

- `pnpm build` inlines `NEXT_PUBLIC_*`. A `.env.local` pointing at
  `/vendor/trust-check.js` ends up in the build; the smoke test still passes
  because it mocks the script, but do not deploy such a build.
- `public/vendor/` is gitignored. Never commit the built widget.
- Copy rules are enforced by `pnpm lint:positioning` (see CONTRIBUTING.md).
