import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { CodeTabs, type CodeTab } from '@/components/CodeTabs';
import { PhoneRequirements } from '@/components/PhoneRequirements';
import { TrustCheckForm } from '@/components/TrustCheckForm';
import { CDN_SCRIPT_URL, DOCS_URL, REPO_URL } from '@/lib/config';
import { EXAMPLES, exampleUrl, readExample } from '@/lib/examples';
import { highlight } from '@/lib/highlight';

const STEP_SCRIPT = `<script
  src="${CDN_SCRIPT_URL}"
  async defer></script>`;

const STEP_DIV = `<div class="pg-trust-check"
     data-callback="onVerified"
     data-action="signup"></div>

<!-- adds a hidden input:
     pg-trust-check-response -->`;

const STEP_VERIFY = `POST https://api.polyguard.ai/v2/siteverify
response=<session>&remoteip=203.0.113.9

{ "success": true,
  "hostname": "www.example.com",
  "score": "PASS",
  "challenge_ts": "2026-10-22T18:40:12Z" }`;

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

async function exampleTabs(): Promise<CodeTab[]> {
  return Promise.all(
    EXAMPLES.map(async (ex) => ({
      label: ex.label,
      path: ex.path,
      url: exampleUrl(ex.path),
      note: ex.note,
      html: await highlight(readExample(ex.path), ex.lang),
    })),
  );
}

export default async function Home() {
  const tabs = await exampleTabs();

  return (
    <>
      <section id="top" className="bg-surface px-4 pt-16 pb-14 sm:px-6 md:pt-[72px]">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-12">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-[22px]">
            <span className="self-start rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-ink">
              Free · no account required · 1,000 Trust Checks a week
            </span>
            <h1 className="m-0 text-4xl leading-[1.1] font-bold tracking-[-0.02em] md:text-[46px]">
              The only modern way to be sure an agent didn&apos;t fill in your form.
            </h1>
            <p className="m-0 text-lg leading-normal text-muted">
              reCAPTCHA and Turnstile score the browser, and a browser driven by a language model
              passes. A Polyguard Trust Check replaces the checkbox. The visitor confirms with their
              phone in a few seconds, and your server verifies the result with one request. You add
              one script tag and one div.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#demo"
                className="inline-flex h-[46px] items-center rounded-md bg-primary px-5 font-semibold text-white no-underline hover:bg-primary-strong hover:text-white"
              >
                Try it on this page
              </a>
              <a
                href="#how"
                className="inline-flex h-[46px] items-center rounded-md border border-line-strong bg-white px-5 font-semibold text-ink no-underline hover:text-ink"
              >
                Read the three steps
              </a>
            </div>
            <p className="m-0 text-[13px] text-muted">
              Visitors need a phone. They do not need to install an app.
            </p>
          </div>
          <div className="min-w-0 flex-[0_1_420px]">
            <TrustCheckForm id="demo" />
          </div>
        </div>
      </section>

      <section id="how" className="px-4 py-16 sm:px-6">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-7">
          <h2 className="m-0 text-3xl font-bold">Three steps</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-3">
              <span className="text-[13px] font-semibold text-primary">1. Load the script</span>
              <CodeBlock code={STEP_SCRIPT} lang="html" small wrap />
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <span className="text-[13px] font-semibold text-primary">
                2. Place the widget in your form
              </span>
              <CodeBlock code={STEP_DIV} lang="html" small wrap />
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <span className="text-[13px] font-semibold text-primary">
                3. Verify the result on your server
              </span>
              <CodeBlock code={STEP_VERIFY} lang="http" small wrap />
            </div>
          </div>
          <p className="m-0 text-sm text-muted">
            Your server compares <span className="font-mono">hostname</span> with its own, as with
            reCAPTCHA or Turnstile. Polyguard accepts each result once, within 300 seconds of the
            Trust Check.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6" aria-labelledby="examples-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-4">
          <h2 id="examples-title" className="m-0 text-2xl font-bold">
            Server-side verification in your stack
          </h2>
          <CodeTabs tabs={tabs} />
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

      <section id="claim" className="px-4 py-16 sm:px-6">
        <div className="mx-auto flex max-w-[1120px] flex-wrap gap-10">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
            <h2 className="m-0 text-3xl font-bold">Your site, your account</h2>
            <p className="m-0 text-[15px] leading-relaxed text-muted">
              When a Trust Check runs from a hostname for the first time, Polyguard creates an
              account and a Custom app for that hostname. The account is limited to 1,000 Trust
              Checks per week across every hostname and page in it. To manage the account, sign in
              to the console and claim the hostname by publishing one file.
            </p>
            <Link
              href="/claim"
              className="inline-flex h-11 items-center self-start rounded-md bg-primary px-[18px] font-semibold text-white no-underline hover:bg-primary-strong hover:text-white"
            >
              How claiming works
            </Link>
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5">
            <span className="text-[13px] font-semibold break-all text-primary">
              https://www.example.com/.well-known/polyguard.json
            </span>
            <CodeBlock code={CLAIM_FILE} lang="json" />
            <p className="m-0 text-[13px] text-muted">
              Serve it over https without a redirect. One file can list every hostname that points
              at your origin, each with its own token. A hostname belongs to one account.
            </p>
          </div>
        </div>
      </section>

      <section id="migrate" className="px-4 pb-16 sm:px-6">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface px-6 py-7 sm:px-8">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 className="m-0 text-[22px] font-bold">Coming from reCAPTCHA or Turnstile?</h2>
            <p className="m-0 text-sm text-muted">
              Side-by-side diffs of the script URL, class name, hidden field and endpoint.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/migrate/recaptcha"
              className="inline-flex h-[42px] items-center rounded-md border border-line-strong bg-white px-4 font-semibold text-ink no-underline hover:text-ink"
            >
              From reCAPTCHA v2
            </Link>
            <Link
              href="/migrate/turnstile"
              className="inline-flex h-[42px] items-center rounded-md border border-line-strong bg-white px-4 font-semibold text-ink no-underline hover:text-ink"
            >
              From Turnstile
            </Link>
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
          <div className="flex flex-col gap-3 pt-4">
            <h3 className="m-0 text-base font-semibold">What the visitor needs</h3>
            <PhoneRequirements />
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
