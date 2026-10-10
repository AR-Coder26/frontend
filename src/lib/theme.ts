/**
 * Single source of truth for the theme system: the storage key, the media query, the
 * types, and the inline script that runs BEFORE first paint (see app/layout.tsx).
 *
 * Why an inline script and not just React state: the server cannot know the visitor's
 * saved choice, so the HTML always arrives without a `dark` class. If the class were only
 * added after hydration, a dark-mode visitor would see a flash of the light theme on every
 * page load. The script below runs synchronously while the <head> is parsed, so the first
 * paint is already in the right theme.
 */

export const THEME_STORAGE_KEY = 'brandox-theme';
export const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

/** What the visitor chose. 'system' means "follow the operating system". */
export type ThemePreference = 'light' | 'dark' | 'system';
/** What is actually painted right now. */
export type ResolvedTheme = 'light' | 'dark';

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Must stay dependency-free and wrapped in try/catch: localStorage throws in some private
 * modes and when storage is blocked, and a thrown error here would stop the rest of the
 * <head> script from running. On any failure the page simply stays in the light theme.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var s=localStorage.getItem(k);var d=s==='dark'||(s!=='light'&&window.matchMedia(${JSON.stringify(
  DARK_MEDIA_QUERY,
)}).matches);var r=document.documentElement;if(d){r.classList.add('dark')}else{r.classList.remove('dark')}r.style.colorScheme=d?'dark':'light'}catch(e){}})();`;
