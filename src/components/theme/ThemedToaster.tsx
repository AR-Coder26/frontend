// src/components/theme/ThemedToaster.tsx
'use client';

import { Toaster } from 'sonner';
import { useTheme } from './ThemeProvider';

/** Sonner toasts follow the painted theme (including a manual override of the OS setting),
 *  not just the OS preference. */
export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster richColors closeButton position="top-center" theme={resolvedTheme} />;
}
