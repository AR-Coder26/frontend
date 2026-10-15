import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * One placeholder block. Uses the shared `.skeleton` shimmer from globals.css, which is
 * theme-aware (--skeleton-shine) and already switched off for reduced-motion users.
 * Purely decorative, so it is hidden from assistive technology.
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('skeleton rounded-md', className)} {...props} />;
}

interface LoadingRegionProps {
  /** Spoken once to screen-reader users, e.g. "Loading product". */
  label?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Wrap a whole skeleton screen in this. Screen-reader users hear one polite "Loading …"
 * instead of nothing at all (empty boxes announce nothing), and `aria-busy` tells assistive
 * tech the region's content is not final yet.
 */
export function LoadingRegion({ label = 'Loading', className, children }: LoadingRegionProps) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}
