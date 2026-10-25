# Contributing

Issues and pull requests are welcome: bugs, copy fixes, and examples for
frameworks we do not cover yet.

## Before you open a pull request

```bash
pnpm typecheck
pnpm lint
pnpm lint:positioning
pnpm build && pnpm test:e2e
```

The CI workflow runs the same steps.

## Adding an example

1. Put it under `examples/<framework>/`. Keep it to one or two files that a
   reader can copy into their own app.
2. Read `pg-trust-check-response` from the form, POST it as `response` (and
   `remoteip` when you have it) to `https://api.polyguard.ai/v2/siteverify`
   with a timeout, then require `success === true` **and** compare `hostname`
   with the site's own hostname. Treat `secret` as optional.
3. List it in `examples/README.md` and in the stack list in `public/llms.txt`.

## Copy rules

`pnpm lint:positioning` enforces these in `app/`, `components/`, `lib/`,
`examples/`, `README.md` and this file:

- Polyguard **verifies**, **confirms** and **prevents**. `FORBIDDEN` in `lib/positioning-lint.ts` lists the words to avoid.
- "Polyguard" is one word. "Trust Check" has both words capitalized. "PG-Presence" is hyphenated. "Privacy First" is written exactly so.
- No em-dashes and no hyperbole. `SLOP` in `lib/positioning-lint.ts` lists banned filler words.
- Name the literal agent of each verb. Software and people act; abstractions ("the check", "claiming", "the default") do not.
- Copy may say CAPTCHA and name reCAPTCHA and Turnstile.

## Commit style

Imperative subject lines under 70 characters.
