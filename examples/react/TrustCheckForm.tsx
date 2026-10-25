'use client';

import { useState, type FormEvent } from 'react';
import { usePolyguardTrustCheck } from './usePolyguardTrustCheck';

export function SignupForm() {
  const { ref, response, error, reset } = usePolyguardTrustCheck({ action: 'signup' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    // The widget's hidden pg-trust-check-response input is inside the form.
    const res = await fetch('/api/signup', {
      method: 'POST',
      body: new FormData(event.currentTarget),
    });
    setStatus(res.ok ? 'done' : 'failed');
    // Polyguard accepts a response once; a second submission needs a new Trust Check.
    reset();
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Email <input name="email" type="email" required />
      </label>
      <div className="pg-trust-check" ref={ref} />
      {error && <p role="alert">Trust Check error: {error}</p>}
      <button type="submit" disabled={!response || status === 'sending'}>
        Create account
      </button>
      {status === 'done' && <p>Account created.</p>}
      {status === 'failed' && <p role="alert">The server did not accept the Trust Check.</p>}
    </form>
  );
}
