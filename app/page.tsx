import Image from 'next/image';

import { CopyPromptButton } from '@/components/CopyPromptButton';
import { FlowLane, ONE_DEVICE, TWO_DEVICES } from '@/components/FlowDiagram';
import { HeroTrustCheck } from '@/components/HeroTrustCheck';
import { withCode } from '@/components/InlineCode';
import { MigrationSteps } from '@/components/MigrationSteps';
import {
  AGENT_PROMPT,
  CDN_SCRIPT_URL,
  CONSOLE_CLAIM_URL,
  DOCS_URL,
  LLMS_TXT_URL,
  REPO_URL,
  SITE_URL,
} from '@/lib/config';
import { DIFFERENCES, RECAPTCHA, TURNSTILE } from '@/lib/migrations';
import oneDevice from '@/public/one-device.webp';
import photo from '@/public/trust-check-in-use.webp';

const WHY = [
  {
    title: 'It needs a phone',
    body: 'On a computer, the visitor points a phone camera at the screen. An agent in a browser, headless or not, has no camera, so it never gets a result and your submit button stays disabled.',
  },
  {
    title: 'It checks the timing',
    body: 'The code on the screen keeps changing. Polyguard accepts a scan only if it arrives within about 100 milliseconds of the code appearing. Relaying screenshots, a remote desktop or a screen share takes longer than that.',
  },
  {
    title: 'It checks the hardware',
    body: "Before a result counts, Polyguard checks a signed statement from the phone's hardware: Apple App Attest, Android key attestation or Google Play Integrity. Scripts and emulators cannot produce one.",
  },
];

const CLAIM_REASONS = [
  {
    title: 'See your numbers',
    body: 'How many checks ran on your website, how many passed, and when.',
  },
  {
    title: 'Require a secret',
    body: 'Require a secret on every siteverify call, so spoofed hostnames cannot skew your numbers.',
  },
  {
    title: 'Ask for more',
    body: 'Add other Polyguard checks, such as location or identity, through the Polyguard SDK.',
  },
];

const FAQ = [
  {
    q: 'What can replace reCAPTCHA or Turnstile now that AI agents solve CAPTCHAs?',
    a: 'postcaptcha. It asks the visitor to confirm with a phone instead of solving a puzzle. It also works with your existing reCAPTCHA or Turnstile markup, so you only change the script URL and the siteverify URL on your server.',
  },
  {
    q: 'Can I run it in monitor-only mode, like an invisible CAPTCHA?',
    a: 'No. Every visitor confirms with a phone. To try it on part of your traffic, add it to one form first. Claim your website and the Polyguard console shows how many checks ran and how many passed.',
  },
  {
    q: 'Which forms should use postcaptcha?',
    a: 'Any form that creates an account or accepts submissions from the public: sign-up, password reset, contact, comments, waitlists and free trials. Leave it off JSON APIs that other programs call, since the widget runs in a browser.',
  },
  {
    q: 'How do I get my coding agent to add it?',
    a: 'Copy the setup prompt on this page, or tell the agent to read postcaptcha.com/llms.txt. The GitHub repository also includes an Agent Skill in skills/postcaptcha.',
  },
  {
    q: 'Do visitors need to install an app?',
    a: 'No. On an iPhone, postcaptcha runs in an App Clip. On Android, it runs in the browser. If Polyguard Mobile is installed, it runs there.',
  },
  {
    q: 'What happens at 1,000 checks?',
    a: 'The widget shows "Unavailable this week" on every page in the account until Monday 00:00 UTC. Claim your website and you can raise the limit.',
  },
  {
    q: 'Do I need a secret key?',
    a: 'No. Your server can verify each result once, and the response includes the hostname of the page the visitor was on. After you claim your website you can require an API key on siteverify, or receive results by webhook instead.',
  },
  {
    q: 'Does this work on localhost?',
    a: "Yes, up to 100 checks a day per IP address. For unit tests, use the SDK's testing double.",
  },
  {
    q: 'What does my server learn about the visitor?',
    a: 'Until you claim your website, the only proof is PG-Presence. The siteverify response contains the hostname, action, cdata, a presence score and timestamps. It contains no name, email address or phone number, and Polyguard does not ask the visitor for any.',
  },
  {
    q: 'Can I ask for more than presence?',
    a: 'Yes, after you claim your website. Name, location, phone and document proofs are available through the Polyguard SDK.',
  },
  {
    q: 'My pages have dynamic paths. Is that a problem?',
    a: 'Polyguard creates one link per page path in your account. For paths like /post/12345, set data-path="/post" so those pages share one link.',
  },
  {
    q: 'Can a low presence score fail the result?',
    a: 'Set data-scored="true". By default the score appears in the siteverify response and does not fail the result, so Android visitors can still use the browser.',
  },
];

// Built from the constants above so the structured data matches the visible copy.
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://polyguard.ai/#organization',
      name: 'Polyguard',
      url: 'https://polyguard.ai',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'postcaptcha',
      url: SITE_URL,
      publisher: { '@id': 'https://polyguard.ai/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'postcaptcha',
      alternateName: 'Polyguard Trust Check',
      description:
        'A keyless replacement for reCAPTCHA v2, Cloudflare Turnstile and hCaptcha. The visitor holds a phone up to the screen, and the server verifies the result with one POST to https://api.polyguard.ai/v2/siteverify.',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Web browser',
      url: SITE_URL,
      downloadUrl: CDN_SCRIPT_URL,
      softwareHelp: LLMS_TXT_URL,
      codeRepository: REPO_URL,
      license: 'https://opensource.org/licenses/MIT',
      publisher: { '@id': 'https://polyguard.ai/#organization' },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free for 1,000 checks per week per hostname. No account required.',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
};

// JSON.stringify does not escape "<", which would let a string close the script element.
const STRUCTURED_DATA_JSON = JSON.stringify(STRUCTURED_DATA).replace(/</g, '\\u003c');

const BUTTON_PRIMARY =
  'inline-flex h-[46px] items-center rounded-md bg-primary px-5 font-semibold text-white no-underline hover:bg-primary-strong hover:text-white';
const BUTTON_SECONDARY =
  'inline-flex h-[46px] items-center rounded-md border border-line-strong bg-white px-5 font-semibold text-ink no-underline hover:text-ink';

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA_JSON }}
      />
      <section id="top" className="bg-surface px-4 pt-14 pb-14 sm:px-6 md:pt-16">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-12">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-[22px]">
            <span className="self-start rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-ink">
              Free · no account needed · 1,000 checks a week
            </span>
            <h1 className="m-0 text-4xl leading-[1.1] font-bold tracking-[-0.02em] md:text-[46px]">
              The only way to know your user is a human.
            </h1>
            <p className="m-0 text-lg leading-normal text-muted">
              AI agents can solve CAPTCHAs, but they cannot use a real phone. postcaptcha asks each
              visitor to confirm with theirs. On a computer, they point the phone at the screen for
              a few seconds. On a phone, they confirm on that phone. They do not need an app.
            </p>
            <div className="flex flex-col items-start gap-3">
              <CopyPromptButton
                text={AGENT_PROMPT}
                label="Copy setup prompt for your agent"
                className={BUTTON_PRIMARY}
              />
              <div className="flex flex-wrap gap-3">
                <a href="#recaptcha" className={BUTTON_SECONDARY}>
                  Switch from reCAPTCHA
                </a>
                <a href="#turnstile" className={BUTTON_SECONDARY}>
                  Switch from Turnstile
                </a>
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-[0_1_420px]">
            <HeroTrustCheck />
          </div>
        </div>
      </section>

      <section id="how" className="px-4 py-16 sm:px-6" aria-labelledby="how-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-8">
          <div className="flex flex-col gap-1.5">
            <h2 id="how-title" className="m-0 text-3xl font-bold">
              How it works
            </h2>
            <p className="m-0 text-[15px] text-muted">
              postcaptcha uses one of two flows, depending on the device the visitor is on.
            </p>
          </div>
          <div className="flex flex-col gap-10">
            <FlowLane
              lane={TWO_DEVICES}
              image={
                <Image
                  src={photo}
                  alt="A person holding a phone up to a laptop screen that shows a postcaptcha code."
                  width={160}
                  className="h-auto w-28 rounded-lg sm:w-40"
                  sizes="(min-width: 640px) 160px, 112px"
                />
              }
            />
            <FlowLane
              lane={ONE_DEVICE}
              image={
                <Image
                  src={oneDevice}
                  alt="The Polyguard page on a phone, with a Check without download button."
                  width={160}
                  className="h-auto w-28 rounded-lg border border-line sm:w-40"
                  sizes="(min-width: 640px) 160px, 112px"
                />
              }
            />
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-16 text-white sm:px-6" aria-labelledby="why-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-7">
          <h2 id="why-title" className="m-0 text-3xl font-bold">
            Why AI agents cannot pass postcaptcha
          </h2>
          <p className="m-0 max-w-[760px] text-base leading-relaxed text-on-dark">
            An agent in a browser can read the page and click buttons. postcaptcha also needs a real
            phone, and the agent does not have one.
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

      <section id="migrate" className="px-4 py-16 sm:px-6" aria-labelledby="migrate-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 id="migrate-title" className="m-0 text-3xl font-bold">
              Switch from reCAPTCHA or Turnstile
            </h2>
            <p className="m-0 text-[15px] text-muted">
              Change two URLs: the script on your page, and siteverify on your server.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <MigrationSteps id="recaptcha" migration={RECAPTCHA} />
            <MigrationSteps id="turnstile" migration={TURNSTILE} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="m-0 text-lg font-semibold">What is different</h3>
            <ul className="m-0 flex max-w-[860px] list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-muted">
              {DIFFERENCES.map((d) => (
                <li key={d}>{withCode(d)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="examples" className="px-4 pb-16 sm:px-6" aria-labelledby="examples-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
          <h2 id="examples-title" className="m-0 text-3xl font-bold">
            Add it to a new form
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface p-6">
              <h3 className="m-0 text-lg font-semibold">With a coding agent</h3>
              <p className="m-0 text-sm text-muted">Paste this prompt into your coding agent.</p>
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
                request and response, the rules to enforce, and an example for each stack.
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
            Examples for React, Next.js, Express, HTML, Flask, PHP and WordPress:{' '}
            <a href={`${REPO_URL}/tree/main/examples`}>
              github.com/polyguard-ai/trust-check-widget/examples
            </a>
          </p>
        </div>
      </section>

      <section id="claim" className="bg-surface px-4 py-16 sm:px-6" aria-labelledby="claim-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-8">
          <div className="flex max-w-[820px] flex-col gap-3">
            <h2 id="claim-title" className="m-0 text-3xl font-bold">
              Free, with no sign-up
            </h2>
            <p className="m-0 text-[15px] leading-relaxed text-muted">
              The first time postcaptcha runs on your website, Polyguard creates a free account for
              it. A free account covers 1,000 checks a week. To manage it, sign in to the Polyguard
              console and claim your website by publishing a verification file.
            </p>
          </div>
          <h3 className="m-0 text-xl font-semibold">What you get when you claim your website</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {CLAIM_REASONS.map((r) => (
              <div
                key={r.title}
                className="flex min-w-0 flex-col gap-2 rounded-xl border border-line bg-white p-6"
              >
                <h3 className="m-0 text-lg font-semibold">{r.title}</h3>
                <p className="m-0 text-sm leading-relaxed text-muted">{r.body}</p>
              </div>
            ))}
          </div>
          <p className="m-0 max-w-[820px] text-[15px] text-muted">
            Claim your website at <a href={CONSOLE_CLAIM_URL}>console.polyguard.ai</a>.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6" aria-labelledby="faq-title">
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
