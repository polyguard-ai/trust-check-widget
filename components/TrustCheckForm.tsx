'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { API_SERVER, TRUST_CHECK_SCRIPT_URL } from '@/lib/config';

type TrustCheckApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

type LoaderWindow = Window & {
  Polyguard?: { TrustCheck?: TrustCheckApi };
  __pgTrustCheckLoaded?: boolean;
  __pgTrustCheckQueue?: Array<() => void>;
};

const LOAD_TIMEOUT_MS = 10_000;

/** Runs `fn` once the layout's trust-check.js has called its onload callback. */
function whenLoaded(fn: () => void): () => void {
  const w = window as LoaderWindow;
  if (w.__pgTrustCheckLoaded && w.Polyguard?.TrustCheck) {
    fn();
    return () => {};
  }
  const queue = (w.__pgTrustCheckQueue ||= []);
  queue.push(fn);
  return () => {
    const i = queue.indexOf(fn);
    if (i !== -1) queue.splice(i, 1);
  };
}

type SubmitResult = { status: number; body: unknown };

export function TrustCheckForm({ id = 'demo' }: { id?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [response, setResponse] = useState('');
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [scriptMissing, setScriptMissing] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    let rendered = false;
    const timer = setTimeout(() => {
      if (!rendered) setScriptMissing(true);
    }, LOAD_TIMEOUT_MS);
    const cancel = whenLoaded(() => {
      const api = (window as LoaderWindow).Polyguard?.TrustCheck;
      if (!api || !container.current) return;
      rendered = true;
      setScriptMissing(false);
      widgetId.current = api.render(container.current, {
        apiServer: API_SERVER,
        action: 'demo',
        size: 'flexible',
        theme: 'light',
        callback: (value: string) => {
          setResponse(value);
          setWidgetError(null);
        },
        'expired-callback': () => setResponse(''),
        'error-callback': (code: string) => {
          setResponse('');
          setWidgetError(code);
        },
      });
    });
    return () => {
      clearTimeout(timer);
      cancel();
      if (widgetId.current)
        (window as LoaderWindow).Polyguard?.TrustCheck?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!response) return;
    setSending(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        body: new FormData(event.currentTarget),
      });
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        body = { error: 'non_json_response' };
      }
      setResult({ status: res.status, body });
    } catch {
      setResult({ status: 0, body: { error: 'network_error' } });
    } finally {
      setSending(false);
      // A response verifies once, so the next send needs a new Trust Check.
      if (widgetId.current) (window as LoaderWindow).Polyguard?.TrustCheck?.reset(widgetId.current);
      setResponse('');
    }
  }

  const verified =
    !!result &&
    typeof result.body === 'object' &&
    result.body !== null &&
    (result.body as { verified?: unknown }).verified === true;

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      aria-labelledby={`${id}-title`}
      className="flex min-w-0 flex-col gap-3.5 rounded-xl border border-line bg-white p-6 shadow-[0_12px_40px_rgba(16,24,35,0.08)]"
    >
      <h2 id={`${id}-title`} className="m-0 text-lg font-semibold">
        Live demo: send us a note
      </h2>
      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        Your name
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Sam Rivera"
          className="h-11 rounded-md border border-line-strong px-3 text-sm font-normal"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        Message
        <textarea
          name="message"
          placeholder="Hello from a person"
          rows={3}
          className="resize-none rounded-md border border-line-strong px-3 py-2.5 text-sm font-normal"
        />
      </label>

      <div ref={container} className="pg-trust-check min-h-[65px]" data-testid="trust-check" />

      {scriptMissing && (
        <p role="status" className="m-0 text-[13px] text-muted">
          The widget script has not loaded from{' '}
          <span className="font-mono break-all">{TRUST_CHECK_SCRIPT_URL}</span>.
        </p>
      )}
      {widgetError && (
        <p role="alert" className="m-0 text-[13px] text-del-ink">
          Trust Check error: <span className="font-mono">{widgetError}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={!response || sending}
        className="h-[46px] rounded-md bg-primary text-[15px] font-semibold text-white enabled:hover:bg-primary-strong disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-muted"
      >
        {sending ? 'Sending…' : 'Send'}
      </button>

      {result ? (
        <div className="flex min-w-0 flex-col gap-2" aria-live="polite">
          <p className="m-0 text-sm font-semibold" data-testid="submit-outcome">
            {verified
              ? 'Verified: siteverify returned success and the hostname matched.'
              : `Not verified (HTTP ${result.status}).`}
          </p>
          <pre
            data-testid="submit-result"
            className="m-0 max-h-80 overflow-auto rounded-lg bg-ink p-4 font-mono text-xs leading-relaxed text-line"
          >
            {JSON.stringify(result.body, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="m-0 text-xs text-muted">
          After you send, this page shows the JSON our server received from{' '}
          <span className="font-mono">/v2/siteverify</span>.
        </p>
      )}
    </form>
  );
}
