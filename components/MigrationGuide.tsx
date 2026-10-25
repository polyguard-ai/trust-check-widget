import Link from 'next/link';
import { CodeDiff } from '@/components/CodeDiff';
import { DiffTable } from '@/components/DiffTable';
import { PhoneRequirements } from '@/components/PhoneRequirements';
import type { Migration } from '@/lib/migrations';

export function MigrationGuide({ migration: m }: { migration: Migration }) {
  const other =
    m.slug === 'recaptcha'
      ? { href: '/migrate/turnstile', label: 'From Turnstile' }
      : { href: '/migrate/recaptcha', label: 'From reCAPTCHA v2' };

  return (
    <div className="px-4 py-14 sm:px-6">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-12">
        <header className="flex flex-col gap-3">
          <span className="text-[13px] font-semibold text-primary">Migration guide</span>
          <h1 className="m-0 text-4xl leading-tight font-bold tracking-[-0.01em]">
            From {m.fromLabel} to a Polyguard Trust Check
          </h1>
          <p className="m-0 max-w-[760px] text-lg leading-normal text-muted">
            Change the script URL and the server call. The widget also renders your existing
            container, keeps its hidden field name, and defines the old JS global when the page has
            not, so the class name, field name and global can be renamed later. Your server keeps
            comparing <span className="font-mono">hostname</span>, as the {m.name} documentation
            already instructs.
          </p>
          <p className="m-0 text-sm">
            <Link href={other.href}>{other.label}</Link>
          </p>
        </header>

        <section className="flex flex-col gap-4" aria-labelledby="names-title">
          <h2 id="names-title" className="m-0 text-2xl font-bold">
            Names and endpoints
          </h2>
          <DiffTable fromLabel={m.fromLabel} rows={m.rows} />
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="markup-title">
          <h2 id="markup-title" className="m-0 text-2xl font-bold">
            Markup
          </h2>
          <CodeDiff before={m.htmlBefore} after={m.htmlAfter} fromLabel={m.fromLabel} />
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="server-title">
          <h2 id="server-title" className="m-0 text-2xl font-bold">
            Server-side verification
          </h2>
          <CodeDiff before={m.serverBefore} after={m.serverAfter} fromLabel={m.fromLabel} />
          <p className="m-0 text-sm text-muted">
            Versions for Next.js, Express, Flask, PHP and WordPress are in the{' '}
            <a href="https://github.com/polyguard-ai/trust-check-widget/tree/main/examples">
              examples directory
            </a>
            .
          </p>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="diff-title">
          <h2 id="diff-title" className="m-0 text-2xl font-bold">
            What is different
          </h2>
          <ul className="m-0 flex max-w-[860px] list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-muted">
            {m.differences.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="phone-title">
          <h2 id="phone-title" className="m-0 text-2xl font-bold">
            What the visitor needs
          </h2>
          <PhoneRequirements />
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/demo"
            className="inline-flex h-11 items-center rounded-md bg-primary px-[18px] font-semibold text-white no-underline hover:bg-primary-strong hover:text-white"
          >
            Try the demo form
          </Link>
          <Link
            href="/claim"
            className="inline-flex h-11 items-center rounded-md border border-line-strong px-[18px] font-semibold text-ink no-underline hover:text-ink"
          >
            Claim your site
          </Link>
        </div>
      </div>
    </div>
  );
}
