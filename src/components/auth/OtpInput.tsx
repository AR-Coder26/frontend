'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

const OTP_LENGTH = 6;

export interface OtpInputHandle {
  focusFirst: () => void;
}

interface OtpInputProps {
  /** The full OTP as a single string, e.g. "048213". Always kept at most OTP_LENGTH chars. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  /** Auto-focuses the first box on mount — used when the verify step first appears. */
  autoFocus?: boolean;
}

export const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(function OtpInput(
  { value, onChange, disabled, invalid, autoFocus },
  ref
) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useImperativeHandle(ref, () => ({
    focusFirst: () => inputRefs.current[0]?.focus(),
  }));

  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');

  function setDigitAt(index: number, digit: string) {
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChange(nextDigits.join('').slice(0, OTP_LENGTH));
  }

  function handleChange(index: number, rawInput: string) {
    // Only the last typed character matters — this also transparently handles a box that
    // already had a digit in it being "typed over" rather than needing a manual clear first.
    const incoming = rawInput.replace(/\D/g, '');
    if (!incoming) {
      setDigitAt(index, '');
      return;
    }

    // .slice(-1) rather than incoming[incoming.length - 1] — with this project's
    // noUncheckedIndexedAccess tsconfig option, direct string indexing types as
    // `string | undefined`; .slice() doesn't have that issue and we've already confirmed
    // `incoming` is non-empty above, so this is always exactly one character.
    const lastChar = incoming.slice(-1);
    setDigitAt(index, lastChar);

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      // Current box is already empty — Backspace should hop back and clear the previous one,
      // matching how every OTP UI people are already used to behaves.
      inputRefs.current[index - 1]?.focus();
      setDigitAt(index - 1, '');
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    // Focus the box right after the last pasted digit (or the last box if the paste filled it).
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="6-digit verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          className={cn(
            'h-12 w-11 rounded-md border text-center text-lg font-semibold tracking-widest text-neutral-900',
            'focus:outline-none focus:ring-1 focus:ring-neutral-900',
            'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400',
            invalid ? 'border-red-400' : 'border-neutral-300'
          )}
        />
      ))}
    </div>
  );
});