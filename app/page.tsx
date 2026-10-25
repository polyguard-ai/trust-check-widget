import Image from 'next/image';
import { ClaimLinkForm } from '@/components/ClaimLinkForm';
import { CodeBlock } from '@/components/CodeBlock';
import { CopyPromptButton } from '@/components/CopyPromptButton';
import { DiffTable } from '@/components/DiffTable';
import { FlowDiagram } from '@/components/FlowDiagram';
import { HeroTrustCheck } from '@/components/HeroTrustCheck';
import { AGENT_PROMPT, DOCS_URL, LLMS_TXT_URL, REPO_URL } from '@/lib/config';
import { DIFFERENCES, RECAPTCHA, TURNSTILE } from '@/lib/migrations';
import photo from '@/public/trust-check-in-use.webp';

const CLAIM_FILE = `{
  "site_verification": {
    "www.example.com": "pgsv_4Qm9…Xk2",
    "example.com": "pgsv_8Lp2…Qa7"
  }
}`;

const WHY = [
  {
    title: 'Tests an action in the physical world',
    body: 'The widget displays a code on the screen, and the visitor has to hold a phone camera up to that screen. No script in the browser or on the server stands in for that action. An agent in a browser, headless or not, has no camera, so the Trust Check never completes and the submit button stays disabled.',
  },
  {
    title: 'Optical distance bounding',
    body: 'The code changes rapidly while the visitor holds the phone camera on it for a few seconds. The Polyguard server accepts each capture only if it arrives within about 100 milliseconds of the code appearing on the screen. A screenshot relay, a remote desktop or a screen share adds more delay than that.',
  },
  {
    title: 'Hardware attestation',
    body: 'Before a result counts, the Polyguard server checks a hardware attestation from the phone: Apple App Attest, Android key attestation or Google Play Integrity. A scripted browser or an emulator cannot produce one.',
  },
];

const CLAIM_RULES = [
  'Serve the file at exactly /.well-known/polyguard.json over https. Polyguard does not follow redirects.',
  'Any content type is accepted. The body must be a JSON object under 16 KiB.',
  'Each hostname is claimed separately. www.example.com and example.com are different hostnames, each with its own entry and token.',
  'A value can be a list of tokens, so two people in one organization can start a claim at the same time. A hostname still belongs to one account.',
  'Claim tokens expire after 7 days. The file is not needed once the claim succeeds.',
];

const CLAIM_UNLOCKS = [
  'The app in the Polyguard console, with its per-page links and settings.',
  'App API keys, to send as secret on /v2/siteverify, and the option to require one.',
  'Webhooks, if you would rather receive results than call siteverify.',
  'Other proofs and a higher weekly limit, on request.',
];

const FAQ = [
  {
    q: 'What happens at 1,000 checks?',
    a: 'The widget shows "Unavailable this week" on every page in the account until Monday 00:00 UTC. Claim the hostname and contact us to raise the limit.',
  },
  {
    q: 'Do I need a secret key?',
    a: 'No. A result can be verified once, and the response includes the hostname of the page where the check ran. After you claim the hostname you can require an API key on siteverify, or receive results by webhook instead.',
  },
  {
    q: 'Do visitors need to install an app?',
    a: 'They need a phone, not an app. On an iPhone the Trust Check runs in an App Clip; on Android it runs in the browser. If Polyguard Mobile is installed, the check runs there.',
  },
  {
    q: 'Does this work on localhost?',
    a: "Yes, up to 100 Trust Checks a day per IP address. For unit tests use the SDK's testing double.",
  },
  {
    q: 'What does my server learn about the visitor?',
    a: 'In keyless mode the only proof is PG-Presence. The siteverify response contains the hostname, action, cdata, a presence score and timestamps. It contains no name, email address or phone number, and the visitor is not asked for any.',
  },
  {
    q: 'Can I ask for more than presence?',
    a: 'Not in this mode. Name, location, phone and document proofs are available on a claimed account through the Polyguard SDK.',
  },
  {
    q: 'My pages have dynamic paths. Is that a problem?',
    a: 'Polyguard creates one link per page path in your account. For paths like /post/12345, set data-path="/post" so those pages share one link.',
  },
  {
    q: 'Can a failed presence score fail the check?',
    a: 'Set data-scored="true". By default the score appears in the siteverify response and does not fail the check, so the Android browser path stays available.',
  },
];

const BUTTON_PRIMARY =
  'inline-flex h-[46px] items-center rounded-md bg-primary px-5 font-semibold text-white no-underline hover:bg-primary-strong hover:text-white';
const BUTTON_SECONDARY =
  'inline-flex h-[46px] items-center rounded-md border border-line-strong bg-white px-5 font-semibold text-ink no-underline hover:text-ink';

export default function Home() {
  return (
    <>
      <section id="top" className="bg-surface px-4 pt-14 pb-14 sm:px-6 md:pt-16">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-12">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-[22px]">
            <span className="self-start rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-ink">
              Free · no account required · 1,000 Trust Checks a week
            </span>
            <h1 className="m-0 text-4xl leading-[1.1] font-bold tracking-[-0.02em] md:text-[46px]">
              The only way to be sure an agent didn&apos;t fill in your form.
            </h1>
            <p className="m-0 text-lg leading-normal text-muted">
              reCAPTCHA and Turnstile score the browser, and an agent driving a browser passes. A
              Polyguard Trust Check replaces the checkbox. The visitor confirms with their phone in
              a few seconds, and your server verifies the result with one request. You add one
              script tag and one div.
            </p>
            <div className="flex flex-wrap gap-3">
              <CopyPromptButton
                text={AGENT_PROMPT}
                label="Copy setup prompt for your agent"
                className={BUTTON_PRIMARY}
              />
              <a href="#how" className={BUTTON_SECONDARY}>
                How it works
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Image
                src={photo}
                alt="A person holding a phone up to a laptop screen that shows a Trust Check code."
                width={96}
                className="h-auto w-24 flex-none rounded-lg"
                sizes="96px"
                priority
              />
              <p className="m-0 max-w-[360px] text-[13px] leading-relaxed text-muted">
                The visitor holds their phone up to the screen for a few seconds. They need a phone.
                They do not need to install an app.
              </p>
            </div>
          </div>
          <div className="min-w-0 flex-[0_1_420px]">
            <HeroTrustCheck />
          </div>
        </div>
      </section>

      <section id="how" className="px-4 py-16 sm:px-6" aria-labelledby="how-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-8">
          <h2 id="how-title" className="m-0 text-3xl font-bold">
            How it works
          </h2>
          <FlowDiagram />
          <p className="m-0 max-w-[820px] text-[15px] leading-relaxed text-muted">
            On a laptop or desktop, the widget displays a code that changes rapidly and the visitor
            holds their phone camera up to it. On a phone, the widget opens the check on that phone:
            an App Clip on iPhone, the browser on Android, or Polyguard Mobile if it is installed.
            Either way the widget writes the result into your form and your server verifies it with
            one POST, comparing <span className="font-mono">hostname</span> with its own as with
            reCAPTCHA or Turnstile.
          </p>
        </div>
      </section>

      <section
        id="examples"
        className="scroll-mt-4 px-4 pb-16 sm:px-6"
        aria-labelledby="examples-title"
      >
        <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
          <h2 id="examples-title" className="m-0 text-3xl font-bold">
            Add it to your site
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface p-6">
              <h3 className="m-0 text-lg font-semibold">If you are a person</h3>
              <p className="m-0 text-sm text-muted">
                Copy this prompt and give it to your coding agent. It points at the instructions for
                agents and names what to check on the server.
              </p>
              <pre className="m-0 rounded-lg border border-line bg-white p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink">
                {AGENT_PROMPT}
              </pre>
              <CopyPromptButton
                text={AGENT_PROMPT}
                label="Copy prompt"
                className="inline-flex h-10 items-center self-start rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-strong"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface p-6">
              <h3 className="m-0 text-lg font-semibold">If you are an agent</h3>
              <p className="m-0 text-sm text-muted">
                Read <a href="/llms.txt">{LLMS_TXT_URL}</a>. It has the markup, the siteverify
                contract, the rules to enforce, and one example file per stack.
              </p>
              <p className="m-0 text-sm text-muted">
                The hidden input is <span className="font-mono">pg-trust-check-response</span>. Send
                it to <span className="font-mono">POST /v2/siteverify</span>, require{' '}
                <span className="font-mono">success</span>, and compare{' '}
                <span className="font-mono">hostname</span> with your own.
              </p>
            </div>
          </div>
          <p className="m-0 text-[15px] text-muted">
            Full examples for React, Next.js, Express, HTML, Flask, PHP and WordPress:{' '}
            <a href={`${REPO_URL}/tree/main/examples`}>
              github.com/polyguard-ai/trust-check-widget/examples
            </a>
          </p>
        </div>
      </section>

      <section id="migrate" className="px-4 pb-16 sm:px-6" aria-labelledby="migrate-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 id="migrate-title" className="m-0 text-3xl font-bold">
              Coming from reCAPTCHA or Turnstile?
            </h2>
            <p className="m-0 text-[15px] text-muted">
              Change the script URL and your server call. The class name, hidden field and JS global
              keep working.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="m-0 text-lg font-semibold">From {RECAPTCHA.fromLabel}</h3>
            <DiffTable fromLabel={RECAPTCHA.fromLabel} rows={RECAPTCHA.rows} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="m-0 text-lg font-semibold">From {TURNSTILE.fromLabel}</h3>
            <DiffTable fromLabel={TURNSTILE.fromLabel} rows={TURNSTILE.rows} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="m-0 text-lg font-semibold">What is different</h3>
            <ul className="m-0 flex max-w-[860px] list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-muted">
              {DIFFERENCES.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-16 text-white sm:px-6" aria-labelledby="why-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-7">
          <h2 id="why-title" className="m-0 text-3xl font-bold">
            Why an AI agent cannot submit your form
          </h2>
          <p className="m-0 max-w-[760px] text-base leading-relaxed text-on-dark">
            A CAPTCHA tests whether the visitor can solve a puzzle on the screen, and language
            models solve those puzzles now. PG-Presence tests an action in the physical world: a
            phone held up to the screen. A browser cannot perform it.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {WHY.map((item) => (
              <div key={item.title} className="flex min-w-0 flex-col gap-2.5">
                <h3 className="m-0 text-lg font-semibold">{item.title}</h3>
                <p className="m-0 text-sm leading-relaxed text-on-dark">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="claim" className="px-4 py-16 sm:px-6" aria-labelledby="claim-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-8">
          <div className="flex max-w-[820px] flex-col gap-3">
            <h2 id="claim-title" className="m-0 text-3xl font-bold">
              Free, and no signup required
            </h2>
            <p className="m-0 text-[15px] leading-relaxed text-muted">
              When a Trust Check runs from a hostname for the first time, Polyguard creates a free
              account and a Custom app for that hostname. Your free account is limited to 1,000
              Trust Checks per week. To manage it, sign in to the console and claim the hostname by
              publishing one file. You prove control of the hostname; nothing else is asked.
            </p>
          </div>
          <div className="flex flex-wrap gap-10">
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
              <h3 className="m-0 text-lg font-semibold">Three steps</h3>
              <ol className="m-0 flex list-decimal flex-col gap-3 pl-5 text-[15px] leading-relaxed text-muted">
                <li>
                  Sign in to the Polyguard console (sign-in is itself a Trust Check) and open
                  Settings, then Websites. Enter the hostname and start the claim. The form below
                  builds a console link with the hostname filled in.
                </li>
                <li>
                  Publish the file the console shows at{' '}
                  <span className="font-mono">
                    https://your-hostname/.well-known/polyguard.json
                  </span>
                  .
                </li>
                <li>
                  Click Verify. Polyguard fetches the file and, if the token matches, moves the app
                  and its links into your account. If you already have an account, Polyguard merges
                  the hostname&apos;s account into it.
                </li>
              </ol>
              <ClaimLinkForm />
            </div>
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
              <span className="text-[13px] font-semibold break-all text-primary">
                https://www.example.com/.well-known/polyguard.json
              </span>
              <CodeBlock code={CLAIM_FILE} lang="json" />
              <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-[13px] leading-relaxed text-muted">
                {CLAIM_RULES.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <p className="m-0 text-[13px] text-muted">
                This site serves its own file at{' '}
                <a href="/.well-known/polyguard.json" className="font-mono">
                  /.well-known/polyguard.json
                </a>
                .
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="m-0 text-lg font-semibold">What a claimed account includes</h3>
            <ul className="m-0 flex max-w-[820px] list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-muted">
              {CLAIM_UNLOCKS.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
            <p className="m-0 max-w-[820px] text-sm text-muted">
              If another account has already claimed the hostname, the console shows an error and
              the hostname stays in that account. Leave the file published and contact Polyguard
              support; staff can move the hostname.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-[72px] sm:px-6" aria-labelledby="faq-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-5">
          <h2 id="faq-title" className="m-0 text-3xl font-bold">
            Questions
          </h2>
          <div className="grid gap-x-10 gap-y-5 md:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q} className="flex min-w-0 flex-col gap-1.5">
                <h3 className="m-0 text-base font-semibold">{item.q}</h3>
                <p className="m-0 text-sm leading-normal text-muted">{item.a}</p>
              </div>
            ))}
          </div>
          <p className="m-0 pt-2 text-sm text-muted">
            More in the <a href={DOCS_URL}>Polyguard SDK docs</a>. The source for this site and
            every example is on <a href={REPO_URL}>GitHub</a> under the MIT license.
          </p>
        </div>
      </section>
    </>
  );
}
