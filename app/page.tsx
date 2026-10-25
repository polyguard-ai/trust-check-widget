import Image from 'next/image';

import { CopyPromptButton } from '@/components/CopyPromptButton';
import { FlowLane, ONE_DEVICE, TWO_DEVICES } from '@/components/FlowDiagram';
import { HeroTrustCheck } from '@/components/HeroTrustCheck';
import { MigrationSteps } from '@/components/MigrationSteps';
import { AGENT_PROMPT, CONSOLE_CLAIM_URL, DOCS_URL, LLMS_TXT_URL, REPO_URL } from '@/lib/config';
import { DIFFERENCES, RECAPTCHA, TURNSTILE } from '@/lib/migrations';
import oneDevice from '@/public/one-device.webp';
import photo from '@/public/trust-check-in-use.webp';

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

const CLAIM_REASONS = [
  {
    title: 'See your Trust Checks',
    body: 'Analytics for every postcaptcha Trust Check on your website: how many ran, how many passed, and when.',
  },
  {
    title: 'Lock it down',
    body: 'Require a secret on every siteverify call to prevent spoofed hostnames from polluting your analytics.',
  },
  {
    title: 'Ask for more than presence',
    body: 'Add other Polyguard proofs to the same widget, such as location or identity checks, through the Polyguard SDK.',
  },
];

const FAQ = [
  {
    q: 'What happens at 1,000 checks?',
    a: 'The widget shows "Unavailable this week" on every page in the account until Monday 00:00 UTC. Claim your website and you can raise the limit.',
  },
  {
    q: 'Do I need a secret key?',
    a: 'No. A result can be verified once, and the response includes the hostname of the page where the check ran. After you claim your website you can require an API key on siteverify, or receive results by webhook instead.',
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
    a: 'Not in keyless mode. Name, location, phone and document proofs are available on a claimed account through the Polyguard SDK.',
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
              A CAPTCHA asks your visitor to solve a puzzle, and AI agents solve puzzles. A
              Polyguard Trust Check asks for something an agent cannot do: hold a phone up to the
              screen. If you use reCAPTCHA or Turnstile today, you can block agents by changing the
              script URL and one server call.
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
            <p className="m-0 text-[13px] text-muted">
              Your visitor holds their phone up to the screen for a few seconds. They need a phone,
              but they do not need to install an app.
            </p>
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
          <div className="flex flex-col gap-10">
            <div className="flex flex-wrap items-center gap-8">
              <Image
                src={photo}
                alt="A person holding a phone up to a laptop screen that shows a Trust Check code."
                width={160}
                className="h-auto w-40 flex-none rounded-lg"
                sizes="160px"
              />
              <div className="min-w-0 flex-[1_1_480px]">
                <FlowLane lane={TWO_DEVICES} id="two" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-8">
              <Image
                src={oneDevice}
                alt="The Polyguard hand-off page on a phone, with a Verify without download button."
                width={160}
                className="h-auto w-40 flex-none rounded-lg border border-line"
                sizes="160px"
              />
              <div className="min-w-0 flex-[1_1_480px]">
                <FlowLane lane={ONE_DEVICE} id="one" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="examples" className="px-4 pb-16 sm:px-6" aria-labelledby="examples-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
          <h2 id="examples-title" className="m-0 text-3xl font-bold">
            Add it to your site
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface p-6">
              <h3 className="m-0 text-lg font-semibold">If you are a person</h3>
              <p className="m-0 text-sm text-muted">
                Copy this prompt and paste it to your coding agent.
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
              Just change the script URL and your server-side call to siteverify.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="m-0 text-lg font-semibold">What is different</h3>
            <ul className="m-0 flex max-w-[860px] list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-muted">
              {DIFFERENCES.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <MigrationSteps migration={RECAPTCHA} />
            <MigrationSteps migration={TURNSTILE} />
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-16 text-white sm:px-6" aria-labelledby="why-title">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-7">
          <h2 id="why-title" className="m-0 text-3xl font-bold">
            Why an AI agent cannot bypass postcaptcha
          </h2>
          <p className="m-0 max-w-[760px] text-base leading-relaxed text-on-dark">
            A CAPTCHA tests whether the visitor can solve a puzzle on the screen, and agents can.
            Postcaptcha tests an action in the physical world: a phone held up to the screen. Agents
            don&apos;t have hands.
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
              When a Trust Check runs from your website for the first time, Polyguard creates a free
              account for it. Your free account is limited to 1,000 Trust Checks per week. To manage
              it, sign in to the console and claim your website by publishing a verification file.
            </p>
          </div>
          <h3 className="m-0 text-xl font-semibold">Why would I create an account?</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {CLAIM_REASONS.map((r) => (
              <div
                key={r.title}
                className="flex min-w-0 flex-col gap-2 rounded-xl border border-line bg-surface p-6"
              >
                <h3 className="m-0 text-lg font-semibold">{r.title}</h3>
                <p className="m-0 text-sm leading-relaxed text-muted">{r.body}</p>
              </div>
            ))}
          </div>
          <p className="m-0 max-w-[820px] text-[15px] text-muted">
            Once postcaptcha is running on your website, claim it at{' '}
            <a href={CONSOLE_CLAIM_URL}>console.polyguard.ai</a>.
          </p>
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
