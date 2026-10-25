'use client';

import { useEffect, useRef, useState } from 'react';
import { API_SERVER, TRUST_CHECK_SCRIPT_URL } from '@/lib/config';
import { RESPONSE_FIELD } from '@/lib/siteverify';
import {
  isVerified,
  submitTrustCheck,
  trustCheckApi,
  whenTrustCheckLoaded,
  type SubmitResult,
} from '@/lib/trust-check-loader';

const LOAD_TIMEOUT_MS = 10_000;

/**
 * The landing page demo: the widget alone. When the visitor completes the
 * Trust Check, the page posts the response to /api/submit and shows the
 * siteverify JSON the server received.
 */
export function HeroTrustCheck() {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'verifying' | 'done'>('idle');
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [scriptMissing, setScriptMissing] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    let rendered = false;
    const timer = setTimeout(() => {
      if (!rendered) setScriptMissing(true);
    }, LOAD_TIMEOUT_MS);
    const cancel = whenTrustCheckLoaded(() => {
      const api = trustCheckApi();
      if (!api || !container.current) return;
      rendered = true;
      setScriptMissing(false);
      widgetId.current = api.render(container.current, {
        apiServer: API_SERVER,
        action: 'demo',
        size: 'flexible',
        theme: 'light',
        callback: async (value: string) => {
          setWidgetError(null);
          setPhase('verifying');
          const form = new FormData();
          form.set(RESPONSE_FIELD, value);
          setResult(await submitTrustCheck(form));
          setPhase('done');
          // The response verifies once; the next click starts a new Trust Check.
          if (widgetId.current) trustCheckApi()?.reset(widgetId.current);
        },
        'expired-callback': () => setPhase('idle'),
        'error-callback': (code: string) => {
          setWidgetError(code);
          setPhase('idle');
        },
      });
    });
    return () => {
      clearTimeout(timer);
      cancel();
      if (widgetId.current) trustCheckApi()?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  const verified = isVerified(result);

  return (
    <div
      id="demo"
      className="flex min-w-0 flex-col gap-3.5 rounded-xl border border-line bg-white p-6 shadow-[0_12px_40px_rgba(16,24,35,0.08)]"
    >
      <div className="flex flex-col gap-1">
        <h2 className="m-0 text-lg font-semibold">Try it</h2>
        <p className="m-0 text-sm text-muted">
          Click the box and scan the code with your phone. The JSON our server receives from{' '}
          <span className="font-mono">/v2/siteverify</span> appears below.
        </p>
      </div>

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
      {phase === 'verifying' && (
        <p role="status" className="m-0 text-[13px] text-muted">
          Verifying with /v2/siteverify…
        </p>
      )}

      {result && phase === 'done' && (
        <div className="flex min-w-0 flex-col gap-2" aria-live="polite">
          <p className="m-0 text-sm font-semibold" data-testid="submit-outcome">
            {verified
              ? 'Verified: siteverify returned success and the hostname matched.'
              : `Not verified (HTTP ${result.status}).`}
          </p>
          <pre
            data-testid="submit-result"
            className="m-0 max-h-72 overflow-auto rounded-lg bg-ink p-4 font-mono text-xs leading-relaxed text-line"
          >
            {JSON.stringify(result.body, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
