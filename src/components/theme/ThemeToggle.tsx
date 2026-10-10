// src/components/theme/ThemeToggle.tsx
'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ThemePreference } from '@/lib/theme';
import { useTheme } from './ThemeProvider';

const OPTIONS: ReadonlyArray<{ value: ThemePreference; label: string; Icon: typeof Sun }> = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

interface ThemeToggleProps {
  /** 'icon' = one button that flips light/dark (headers). 'segmented' = explicit
   *  Light / Dark / System choice (menus and drawers). */
  variant?: 'icon' | 'segmented';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { preference, resolvedTheme, mounted, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div role="group" aria-label="Theme" className={cn('grid grid-cols-3 gap-1 rounded-md bg-muted p-1', className)}>
        {OPTIONS.map(({ value, label, Icon }) => {
          const isActive = mounted && preference === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={mounted ? isActive : undefined}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  // Icon variant. Both icons are always rendered and swapped with CSS (`dark:` reads the
  // class the pre-paint script already set on <html>), so the correct icon shows on the very
  // first paint — no hydration mismatch and no icon flash. aria-pressed only appears after
  // mount because that is when the real state is known.
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Dark mode"
      aria-pressed={mounted ? resolvedTheme === 'dark' : undefined}
      title="Switch light / dark theme"
    >
      <Sun className="h-5 w-5 dark:hidden" aria-hidden="true" />
      <Moon className="hidden h-5 w-5 dark:block" aria-hidden="true" />
    </Button>
  );
}
