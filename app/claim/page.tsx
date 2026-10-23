import type { Metadata } from 'next';
import { ClaimLinkForm } from '@/components/ClaimLinkForm';
import { CodeBlock } from '@/components/CodeBlock';

export const metadata: Metadata = {
  title: 'Claim your site',
  description:
    'Claim the account Polyguard created for your hostname by publishing /.well-known/polyguard.json.',
};

const ONE_HOST = `{
  "site_verification": {
    "www.example.com": "pgsv_4Qm9…Xk2"
  }
}`;

const MANY_HOSTS = `{
  "site_verification": {
    "www.example.com": "pgsv_4Qm9…Xk2",
    "example.com": "pgsv_8Lp2…Qa7",
    "shop.example.com": ["pgsv_Z1c7…Rr0", "pgsv_Hn3k…Vb5"]
  }
}`;

const UNLOCKS = [
  'The app in the Polyguard console, with its per-page links and settings.',
  'App API keys, to send as secret on /v2/siteverify, and the option to require one.',
  'Webhooks, if you would rather receive results than call siteverify.',
  'Other proofs and a higher weekly limit, on request.',
];

const RULES = [
  'Serve the file at exactly /.well-known/polyguard.json over https. Redirects are not followed.',
  'Any content type works; the body must be a JSON object under 16 KiB.',
  'Each hostname is claimed separately. www.example.com and example.com are different hostnames, each with its own entry and token.',
  'A value can be a list of tokens, so two people in one organization can start a claim at the same time. A hostname still belongs to one account.',
  'Claim tokens expire after 7 days. The file is not needed once the claim succeeds.',
];

export default function ClaimPage() {
  return (
    <div className="px-4 py-14 sm:px-6">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-12">
        <header className="flex max-w-[820px] flex-col gap-3">
          <span className="text-[13px] font-semibold text-primary">Your site, your account</span>
          <h1 className="m-0 text-4xl leading-tight font-bold tracking-[-0.01em]">
            Claim your site
          </h1>
          <p className="m-0 text-lg leading-normal text-muted">
            The first Trust Check from a new hostname creates an account and a Custom app for it,
            with 1,000 Trust Checks a week shared across everything in the account. Claiming moves
            that account to you. You prove control of the hostname by publishing one file.
          </p>
        </header>

        <section className="flex flex-wrap gap-10" aria-labelledby="steps-title">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
            <h2 id="steps-title" className="m-0 text-2xl font-bold">
              Three steps
            </h2>
            <ol className="m-0 flex list-decimal flex-col gap-3 pl-5 text-[15px] leading-relaxed text-muted">
              <li>
                Sign in to the Polyguard console (with a Trust Check) and open Settings, Websites.
                Enter the hostname and start the claim. The link below fills it in for you.
              </li>
              <li>
                Publish the file the console shows at{' '}
                <span className="font-mono">https://your-hostname/.well-known/polyguard.json</span>.
              </li>
              <li>
                Click Verify. Polyguard fetches the file, and when the token matches, the app and
                its links appear in your account. If you already have an account, the
                hostname&apos;s account is merged into it.
              </li>
            </ol>
            <ClaimLinkForm />
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5">
            <span className="text-[13px] font-semibold break-all text-primary">
              https://www.example.com/.well-known/polyguard.json
            </span>
            <CodeBlock code={ONE_HOST} lang="json" />
            <p className="m-0 text-[13px] text-muted">
              This site publishes its own at{' '}
              <a href="/.well-known/polyguard.json" className="font-mono">
                /.well-known/polyguard.json
              </a>
              .
            </p>
          </div>
        </section>

        <section className="flex flex-wrap gap-10" aria-labelledby="file-title">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
            <h2 id="file-title" className="m-0 text-2xl font-bold">
              The file
            </h2>
            <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-muted">
              {RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5">
            <span className="text-[13px] font-semibold text-primary">
              One file for several hostnames on the same origin
            </span>
            <CodeBlock code={MANY_HOSTS} lang="json" />
          </div>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="unlocks-title">
          <h2 id="unlocks-title" className="m-0 text-2xl font-bold">
            What claiming gives you
          </h2>
          <ul className="m-0 flex max-w-[820px] list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-muted">
            {UNLOCKS.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          <p className="m-0 max-w-[820px] text-sm text-muted">
            If another account has already claimed the hostname, verification returns an error and
            the hostname stays where it is. Contact Polyguard support with the published file in
            place and staff can move it.
          </p>
        </section>
      </div>
    </div>
  );
}
