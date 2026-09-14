import { useEffect, useRef, useState } from "react";

interface UseCountdownResult {
  /** Whole seconds left, floored at 0 — never negative. */
  secondsRemaining: number;
  /** True once secondsRemaining hits 0. Convenience so callers don't repeat `=== 0`. */
  isExpired: boolean;
  /** Restarts the countdown from a new target timestamp (e.g. after a successful "resend"). */
  reset: (newTargetMs: number) => void;
}

export function useCountdown(targetMs: number): UseCountdownResult {
  const [target, setTarget] = useState(targetMs);
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    Math.max(0, Math.ceil((targetMs - Date.now()) / 1000)),
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  useEffect(() => {
    setSecondsRemaining(Math.max(0, Math.ceil((target - Date.now()) / 1000)));

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [target]);

  return {
    secondsRemaining,
    isExpired: secondsRemaining <= 0,
    reset: (newTargetMs: number) => setTarget(newTargetMs),
  };
}

/** Formats whole seconds as "M:SS" for short windows (OTP/reset-token countdowns). */
export function formatMinutesSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Formats whole seconds as "Xh Ym" / "Ym Zs" for the long 2-hour lockout window, where
 *  second-level precision isn't meaningful to a human reading it. */
export function formatLongDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
