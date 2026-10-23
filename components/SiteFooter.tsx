import { REPO_URL } from '@/lib/config';

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-[1120px] flex-wrap justify-between gap-3 text-[13px] text-muted">
        <span>
          <a href="https://polyguard.ai" className="text-muted hover:text-ink">
            Polyguard
          </a>{' '}
          · SOC 2 Type II
        </span>
        <nav className="flex flex-wrap gap-5" aria-label="Footer">
          <a href="https://polyguard.ai/privacy" className="text-muted no-underline hover:text-ink">
            Privacy
          </a>
          <a href="https://polyguard.ai/terms" className="text-muted no-underline hover:text-ink">
            Terms
          </a>
          <a href={REPO_URL} className="text-muted no-underline hover:text-ink">
            Source (MIT)
          </a>
        </nav>
      </div>
    </footer>
  );
}
