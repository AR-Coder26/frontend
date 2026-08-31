// frontend/src/store/adminAuthStore.ts
import { create } from 'zustand';
import { getCurrentAdmin } from '@/lib/api/auth';
import type { AdminUser } from '@/types';

interface AdminAuthState {
  admin: AdminUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  /** Separate from `status` on purpose: `status: 'unauthenticated'` always safely means
   *  "show the login form" (never leaves the UI stuck), but this field tells the login page
   *  WHY, so "you're just logged out" and "the server never responded" don't look identical
   *  to the person staring at the screen. */
  sessionCheckError: string | null;
  fetchCurrentAdmin: () => Promise<void>;
  setAdmin: (admin: AdminUser) => void;
  clearAdmin: () => void;
}

/** If the session check hasn't resolved within this window, something is wrong on the
 *  network/backend side (server not running, CORS misconfigured, etc.) — rather than leave
 *  the person staring at "Checking session…" forever with no way forward, we give up and
 *  treat it as logged-out so the login form always eventually appears. This is the fix for
 *  the exact "stuck on Checking session, never even reached the form" report. */
const SESSION_CHECK_TIMEOUT_MS = 8000;

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  status: 'idle',
  sessionCheckError: null,

  fetchCurrentAdmin: async () => {
    set({ status: 'loading', sessionCheckError: null });
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    try {
      const admin = await Promise.race([
        getCurrentAdmin(),
        new Promise<never>((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error('SESSION_CHECK_TIMEOUT')), SESSION_CHECK_TIMEOUT_MS);
        }),
      ]);
      set({ admin, status: 'authenticated' });
    } catch (error) {
      // A failure here almost always just means "no valid session" (401) — not an error
      // worth surfacing, the admin simply appears logged out and RequireAdminAuth redirects.
      // The timeout case specifically gets its own message, since that one is NOT "you're
      // logged out" — it's "the app couldn't even find out," which is worth saying plainly.
      const timedOut = error instanceof Error && error.message === 'SESSION_CHECK_TIMEOUT';
      set({
        admin: null,
        status: 'unauthenticated',
        sessionCheckError: timedOut
          ? 'Could not reach the server to check your session. Is the backend running?'
          : null,
      });
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
  },

  setAdmin: (admin) => set({ admin, status: 'authenticated', sessionCheckError: null }),
  clearAdmin: () => set({ admin: null, status: 'unauthenticated', sessionCheckError: null }),
}));
