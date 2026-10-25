'use client';

export type TrustCheckApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

type LoaderWindow = Window & {
  Polyguard?: { TrustCheck?: TrustCheckApi };
  __pgTrustCheckLoaded?: boolean;
  __pgTrustCheckQueue?: Array<() => void>;
};

export function trustCheckApi(): TrustCheckApi | undefined {
  return (window as LoaderWindow).Polyguard?.TrustCheck;
}

/** Runs `fn` once the layout's trust-check.js has called its onload callback. */
export function whenTrustCheckLoaded(fn: () => void): () => void {
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

export type SubmitResult = { status: number; body: unknown };

/** Posts a widget response to this site's /api/submit and returns what came back. */
export async function submitTrustCheck(form: FormData): Promise<SubmitResult> {
  try {
    const res = await fetch('/api/submit', { method: 'POST', body: form });
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = { error: 'non_json_response' };
    }
    return { status: res.status, body };
  } catch {
    return { status: 0, body: { error: 'network_error' } };
  }
}

export function isVerified(result: SubmitResult | null): boolean {
  return (
    !!result &&
    typeof result.body === 'object' &&
    result.body !== null &&
    (result.body as { verified?: unknown }).verified === true
  );
}
