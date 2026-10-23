'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SCRIPT_URL = 'https://cdn.polyguard.ai/sdk/latest/trust-check.js';

type RenderOptions = {
  callback?: (response: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: (code: string) => void;
  action?: string;
  cdata?: string;
  path?: string;
  theme?: 'auto' | 'light' | 'dark';
  size?: 'normal' | 'compact' | 'flexible';
  locale?: string;
  scored?: boolean;
};

type TrustCheckApi = {
  render: (container: HTMLElement | string, options?: RenderOptions) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
  getResponse: (id?: string) => string;
};

function globalTrustCheck(): TrustCheckApi | undefined {
  return (window as unknown as { Polyguard?: { TrustCheck?: TrustCheckApi } }).Polyguard
    ?.TrustCheck;
}

let loading: Promise<TrustCheckApi> | null = null;

/** Loads trust-check.js once per page in explicit-render mode. */
function loadTrustCheck(src: string): Promise<TrustCheckApi> {
  const existing = globalTrustCheck();
  if (existing) return Promise.resolve(existing);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const onload = '__pgTrustCheckHookOnload';
    const w = window as unknown as Record<string, unknown>;
    w[onload] = () => {
      delete w[onload];
      const api = globalTrustCheck();
      if (api) resolve(api);
      else reject(new Error('trust-check.js loaded without Polyguard.TrustCheck'));
    };
    const script = document.createElement('script');
    script.src = `${src}${src.includes('?') ? '&' : '?'}render=explicit&onload=${onload}`;
    script.async = true;
    script.onerror = () => {
      loading = null;
      reject(new Error(`Failed to load ${src}`));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export type UsePolyguardTrustCheckOptions = Omit<
  RenderOptions,
  'callback' | 'expired-callback' | 'error-callback'
> & { scriptUrl?: string };

/**
 * Renders a Trust Check into `ref` and tracks its response.
 * `response` is '' until the visitor completes the check, and again after it
 * expires (300 seconds) or `reset()` is called.
 */
export function usePolyguardTrustCheck(options: UsePolyguardTrustCheckOptions = {}) {
  const { scriptUrl = SCRIPT_URL, action, cdata, path, theme, size, locale, scored } = options;
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTrustCheck(scriptUrl)
      .then((api) => {
        if (cancelled || !ref.current) return;
        widgetId.current = api.render(ref.current, {
          action,
          cdata,
          path,
          theme,
          size,
          locale,
          scored,
          callback: (value) => {
            setResponse(value);
            setError(null);
          },
          'expired-callback': () => setResponse(''),
          'error-callback': (code) => {
            setResponse('');
            setError(code);
          },
        });
      })
      .catch(() => {
        if (!cancelled) setError('script_load_failed');
      });
    return () => {
      cancelled = true;
      if (widgetId.current) globalTrustCheck()?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [scriptUrl, action, cdata, path, theme, size, locale, scored]);

  const reset = useCallback(() => {
    if (widgetId.current) globalTrustCheck()?.reset(widgetId.current);
    setResponse('');
    setError(null);
  }, []);

  return { ref, response, error, reset };
}
