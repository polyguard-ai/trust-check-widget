import { Fragment, type ReactNode } from 'react';

/** Renders `backticked` spans of a plain string as inline code. */
export function withCode(text: string): ReactNode {
  const parts = text.split('`');
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className="rounded bg-surface px-1 font-mono text-[0.9em] text-ink">
        {part}
      </code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
