import Link from 'next/link';
import { DOCS_URL, REPO_URL } from '@/lib/config';

const NAV = [
  { href: '/#how', label: 'How it works' },
  { href: '/demo', label: 'Demo' },
  { href: '/migrate/recaptcha', label: 'Migrate' },
  { href: '/claim', label: 'Claim your site' },
];

export function SiteHeader() {
  return (
    <header className="border-b border-line px-4 sm:px-6">
      <div className="mx-auto flex min-h-16 max-w-[1120px] flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <Link
          href="/"
          className="flex items-baseline gap-2 text-base font-bold text-ink no-underline hover:text-ink"
        >
          <span className="text-primary">Polyguard</span>
          <span className="font-medium text-muted">Trust Check Widget</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted no-underline hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <a href={DOCS_URL} className="text-muted no-underline hover:text-ink">
            Docs
          </a>
          <a href={REPO_URL} className="text-muted no-underline hover:text-ink">
            GitHub
          </a>
          <a
            href="https://console.polyguard.ai"
            className="inline-flex h-[38px] items-center rounded-md border border-line-strong px-3.5 font-medium text-ink no-underline hover:text-ink"
          >
            Console
          </a>
        </nav>
      </div>
    </header>
  );
}
