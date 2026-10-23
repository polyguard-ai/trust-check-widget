'use client';

import { useId, useState } from 'react';

export type CodeTab = { label: string; path: string; url: string; html: string; note?: string };

export function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tab = tabs[active];

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Examples"
        className="flex flex-wrap gap-1 border-b border-line"
      >
        {tabs.map((t, i) => (
          <button
            key={t.label}
            id={`${baseId}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`${baseId}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              const next = (active + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
              setActive(next);
              document.getElementById(`${baseId}-tab-${next}`)?.focus();
            }}
            className={`-mb-px h-10 border-b-2 px-3.5 text-sm ${
              i === active
                ? 'border-primary font-semibold text-ink'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="flex min-w-0 flex-col gap-2"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-[13px] text-muted">
          <span className="font-mono">{tab.path}</span>
          <a href={tab.url}>View on GitHub</a>
        </div>
        <div
          className="code-block min-w-0"
          // Shiki output for the repo's own example files, highlighted at build time.
          dangerouslySetInnerHTML={{ __html: tab.html }}
        />
        {tab.note && <p className="m-0 text-[13px] text-muted">{tab.note}</p>}
      </div>
    </div>
  );
}
