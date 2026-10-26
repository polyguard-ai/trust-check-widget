# Examples

Each example sends the widget's `pg-trust-check-response` value to
`POST https://api.polyguard.ai/v2/siteverify` and compares the returned
`hostname` with the site's own, as the reCAPTCHA and Turnstile docs require.

| Directory | What it is |
|---|---|
| `html/` | A plain HTML form with the widget. The `data-callback` function enables the submit button. |
| `react/` | `usePolyguardTrustCheck`, a hook that loads the script in explicit mode; `TrustCheck`, a component built on it; and a form that uses the component. `npx shadcn@latest add https://postcaptcha.com/r/trust-check.json` installs the hook and the component. |
| `nextjs/` | `verifyTrustCheck()`, a server helper, and an App Router route handler that uses it. `npx shadcn@latest add https://postcaptcha.com/r/trust-check-verify.json` installs both. |
| `express/` | Express middleware, `requireTrustCheck({ expectedHostname })`. |
| `python-flask/` | A Flask decorator, `@require_trust_check()`, using only the standard library for the HTTP call. |
| `php/` | `polyguard_siteverify()` with curl, and a form handler. |
| `wordpress/` | Notes only: where the script, the widget and the check go. |

In every example `secret` is optional. Once your hostname is claimed you can
send the App API key from the console as `secret`, and require it from the
app's Advanced tab.
