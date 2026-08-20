import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Standard shadcn/ui helper: merges conditional class lists (clsx) then resolves
// conflicting Tailwind utility classes so the LAST one wins (tailwind-merge) — e.g.
// cn('px-2', isWide && 'px-4') correctly resolves to just 'px-4', never both stacking.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a number as Pakistani Rupees — e.g. formatPKR(2500) -> "Rs. 2,500". Uses Western
 *  (en-US) thousands grouping rather than the lakh/crore grouping some PK sites use above
 *  Rs. 100,000 — fine for per-item clothing prices; revisit if order totals routinely cross
 *  six figures. */
export function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-US')}`;
}