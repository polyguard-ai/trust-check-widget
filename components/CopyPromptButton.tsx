'use client';

import { useState } from 'react';

type Props = { text: string; label: string; className?: string };

export function CopyPromptButton({ text, label, className = '' }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 2000);
  }

  return (
    <button type="button" onClick={copy} className={className} aria-live="polite">
      {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed, select the text' : label}
    </button>
  );
}
