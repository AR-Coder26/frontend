// src/components/theme/ThemeProvider.tsx
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DARK_MEDIA_QUERY,
  THEME_STORAGE_KEY,
  isThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme';

interface ThemeContextValue {
  /** The visitor's choice: 'light' | 'dark' | 'system'. */
  preference: ThemePreference;
  /** The theme actually painted. Only trustworthy once `mounted` is true. */
  resolvedTheme: ResolvedTheme;
  /** False during SSR and the first client render — use it to avoid hydration mismatches. */
  mounted: boolean;
  setTheme: (next: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
  }
  return preference;
}

/**
 * Paints the theme. Uses the View Transitions API for a short cross-fade where the browser
 * supports it; otherwise it suspends every CSS transition for a moment so that buttons with
 * `transition-colors` do not change color out of step with everything else (that staggered
 * change is what reads as "flicker"). Reduced-motion users always get the instant swap.
 */
function paintTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  if (root.classList.contains('dark') === (resolved === 'dark')) return;

  const apply = () => {
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const doc = document as Document & { startViewTransition?: (callback: () => void) => unknown };
  if (!reduceMotion && typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(apply);
    return;
  }

  const freeze = document.createElement('style');
  freeze.appendChild(
    document.createTextNode('*,*::before,*::after{transition:none!important}'),
  );
  document.head.appendChild(freeze);
  apply();
  void window.getComputedStyle(document.body).opacity; // force a style flush while frozen
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => freeze.remove());
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The server and the first client render must agree, so both start from the same neutral
  // values; the real values are read in the effect below. The pre-paint script in <head>
  // has already put the right class on <html>, so nothing visible waits on this state.
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPreference(readStoredPreference());
    setResolvedTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    setMounted(true);
  }, []);

  // "System" follows the operating system live (e.g. automatic sunset switching).
  useEffect(() => {
    if (!mounted || preference !== 'system') return;
    const query = window.matchMedia(DARK_MEDIA_QUERY);
    function handleChange() {
      const next: ResolvedTheme = query.matches ? 'dark' : 'light';
      paintTheme(next);
      setResolvedTheme(next);
    }
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, [mounted, preference]);

  // Keep other open tabs in sync when the choice changes in one of them.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next: ThemePreference = isThemePreference(event.newValue) ? event.newValue : 'system';
      const resolved = resolveTheme(next);
      paintTheme(resolved);
      setPreference(next);
      setResolvedTheme(resolved);
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setTheme = useCallback((next: ThemePreference) => {
    try {
      if (next === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
      else window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage blocked: the choice still applies for this page view, it just won't persist.
    }
    const resolved = resolveTheme(next);
    paintTheme(resolved);
    setPreference(next);
    setResolvedTheme(resolved);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolvedTheme, mounted, setTheme }),
    [preference, resolvedTheme, mounted, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>.');
  return context;
}
