'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  usePolyguardTrustCheck,
  type UsePolyguardTrustCheckOptions,
} from './usePolyguardTrustCheck';

export type TrustCheckHandle = { reset: () => void };

export type TrustCheckProps = UsePolyguardTrustCheckOptions & {
  /** Receives the response when the visitor completes the check, and '' after it expires, fails or is reset. */
  onChange?: (response: string) => void;
  className?: string;
};

/**
 * A Polyguard Trust Check. Place it inside a <form>: on success the widget adds
 * a hidden pg-trust-check-response input that the server sends to siteverify.
 */
export const TrustCheck = forwardRef<TrustCheckHandle, TrustCheckProps>(function TrustCheck(
  { onChange, className, ...options },
  handle,
) {
  const { ref, response, error, reset } = usePolyguardTrustCheck(options);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    onChangeRef.current?.(response);
  }, [response]);
  useImperativeHandle(handle, () => ({ reset }), [reset]);

  return (
    <div className={className}>
      <div className="pg-trust-check" ref={ref} />
      {error && <p role="alert">Trust Check error: {error}</p>}
    </div>
  );
});
