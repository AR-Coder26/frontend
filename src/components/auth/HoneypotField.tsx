'use client';

import type { UseFormRegisterReturn } from 'react-hook-form';

interface HoneypotFieldProps {
  registration: UseFormRegisterReturn;
}

export function HoneypotField({ registration }: HoneypotFieldProps) {
  return (
    <input
      type="text"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      // Real users never see this — it exists purely for automated form-fillers to trip over.
      placeholder="Leave this field empty"
      style={{
        display: 'none',
        visibility: 'hidden',
        opacity: 0,
        position: 'absolute',
        left: '-9999px',
        height: 0,
        width: 0,
      }}
      {...registration}
    />
  );
}