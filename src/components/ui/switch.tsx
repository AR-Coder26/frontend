import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

/** A styled checkbox that LOOKS like a toggle switch — no @radix-ui/react-switch is
 *  installed, and a native checkbox already carries correct semantics/keyboard behavior for
 *  a boolean field (isActive, isCustomStitchingAvailable, isDefault-style flags). */
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ className, ...props }, ref) => (
  <label className={cn('relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center', className)}>
    <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
    <span className="absolute inset-0 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
    <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
  </label>
));
Switch.displayName = 'Switch';

export { Switch };
