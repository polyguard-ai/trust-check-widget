'use client';

import { useState } from 'react';
import { CONSOLE_CLAIM_URL } from '@/lib/config';

const HOSTNAME =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{0,61}[a-z0-9]$/;

function toHostname(input: string): string {
  let value = input.trim().toLowerCase();
  try {
    if (/^https?:\/\//.test(value)) value = new URL(value).hostname;
  } catch {
    return '';
  }
  return value.replace(/\/.*$/, '').replace(/:\d+$/, '').replace(/\.$/, '');
}

export function ClaimLinkForm() {
  const [input, setInput] = useState('');
  const hostname = toHostname(input);
  const valid = HOSTNAME.test(hostname);
  const href = `${CONSOLE_CLAIM_URL}${valid ? encodeURIComponent(hostname) : ''}`;

  return (
    <form
      className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) window.location.assign(href);
      }}
    >
      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        Hostname to claim
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="www.example.com"
          inputMode="url"
          autoCapitalize="none"
          spellCheck={false}
          className="h-11 rounded-md border border-line-strong bg-white px-3 font-mono text-sm font-normal"
        />
      </label>
      {input && !valid && (
        <p className="m-0 text-[13px] text-del-ink">Enter a hostname such as www.example.com.</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!valid}
          className="inline-flex h-11 items-center rounded-md bg-primary px-4 font-semibold text-white enabled:hover:bg-primary-strong disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-muted"
        >
          Claim in the console
        </button>
        <span className="min-w-0 break-all font-mono text-xs text-muted">{href}</span>
      </div>
    </form>
  );
}
