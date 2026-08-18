import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Standard shadcn/ui helper: merges conditional class lists (clsx) then resolves
// conflicting Tailwind utility classes so the LAST one wins (tailwind-merge) — e.g.
// cn('px-2', isWide && 'px-4') correctly resolves to just 'px-4', never both stacking.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}