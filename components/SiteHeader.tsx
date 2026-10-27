'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DOCS_URL, REPO_URL } from '@/lib/config';

const NAV = [
  { href: '#how', label: 'How it works' },
  { href: '#migrate', label: 'Switch' },
  { href: '#examples', label: 'Set up' },
  { href: '#claim', label: 'Free account' },
  { href: DOCS_URL, label: 'Docs' },
  { href: REPO_URL, label: 'GitHub' },
];

const NAV_LINK = 'block py-3 text-base text-muted no-underline hover:text-ink md:py-0 md:text-sm';

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="border-b border-line px-4 sm:px-6">
      <div className="mx-auto flex min-h-16 max-w-[1120px] flex-wrap items-center justify-between gap-x-4 py-3">
        <Link
          href="/"
          onClick={close}
          className="text-lg font-bold tracking-[-0.01em] text-primary no-underline hover:text-primary-strong"
        >
          postcaptcha
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
          className="-mr-2 inline-flex size-10 items-center justify-center rounded-md text-ink hover:bg-surface md:hidden"
        >
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
            <path
              d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
        <nav
          id="site-nav"
          aria-label="Main"
          className={`${open ? 'flex' : 'hidden'} w-full flex-col pt-2 pb-3 md:flex md:w-auto md:flex-row md:items-center md:gap-x-6 md:p-0`}
        >
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={close} className={NAV_LINK}>
              {item.label}
            </a>
          ))}
          <a
            href="https://console.polyguard.ai"
            onClick={close}
            className="mt-2 inline-flex h-[42px] items-center justify-center rounded-md border border-line-strong px-3.5 text-base font-medium text-ink no-underline hover:text-ink md:mt-0 md:h-[38px] md:text-sm"
          >
            Console
          </a>
        </nav>
      </div>
    </header>
  );
}
