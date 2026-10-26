'use client';

import { useRef, useState, type FormEvent } from 'react';
import { TrustCheck, type TrustCheckHandle } from './TrustCheck';

export function SignupForm() {
  const trustCheck = useRef<TrustCheckHandle>(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    // The widget's hidden pg-trust-check-response input is inside the form.
    const res = await fetch('/api/trust-check/verify', {
      method: 'POST',
      body: new FormData(event.currentTarget),
    });
    setStatus(res.ok ? 'done' : 'failed');
    // Polyguard accepts a response once; a second submission needs a new Trust Check.
    trustCheck.current?.reset();
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Email <input name="email" type="email" required />
      </label>
      <TrustCheck ref={trustCheck} action="signup" onChange={setResponse} />
      <button type="submit" disabled={!response || status === 'sending'}>
        Create account
      </button>
      {status === 'done' && <p>Account created.</p>}
      {status === 'failed' && <p role="alert">The server did not accept the Trust Check.</p>}
    </form>
  );
}
