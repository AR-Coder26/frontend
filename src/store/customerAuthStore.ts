// frontend/src/store/customerAuthStore.ts
import { create } from 'zustand';
import { getCurrentCustomer } from '@/lib/api/auth';
import type { Customer } from '@/types';

/**
 * DECISION: this store's `status` starts as 'idle' and only becomes accurate after
 * `fetchCurrentCustomer()` runs client-side (triggered once by <CustomerAuthInitializer>,
 * mounted in StorefrontShell). That means Header briefly shows a neutral/loading state on
 * every fresh page load before flipping to "logged in" or "logged out" — a real, visible
 * tradeoff, not an oversight.
 *
 * The alternative — checking the session SERVER-SIDE in Header.tsx like categories/
 * storeSettings already are — would need Server Components to read the incoming request's
 * cookies via next/headers' cookies() and manually forward them as a Cookie header, since a
 * server-side fetch() has no browser cookie jar to send with `credentials: 'include'` (that
 * option only means something in an actual browser). Doing that would mean teaching
 * lib/api/client.ts to behave differently in server vs. client contexts — a real
 * restructure of the one file every API call goes through, not a small addition. Deferred
 * for now; revisit if the login flash becomes a real UX complaint.
 *
 * Not using Zustand's `persist` middleware here on purpose — unlike cart/wishlist, this data
 * should NEVER be trusted from a stale localStorage cache. The httpOnly cookie is the only
 * real source of truth; this store is just a live mirror of what the server said last time
 * it was asked.
 */
interface CustomerAuthState {
  customer: Customer | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  fetchCurrentCustomer: () => Promise<void>;
  setCustomer: (customer: Customer) => void;
  clearCustomer: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>((set) => ({
  customer: null,
  status: 'idle',

  fetchCurrentCustomer: async () => {
    set({ status: 'loading' });
    try {
      const customer = await getCurrentCustomer();
      set({ customer, status: 'authenticated' });
    } catch {
      // A failure here almost always just means "no valid session" (401) — not an error
      // worth surfacing to the user, they simply appear logged out.
      set({ customer: null, status: 'unauthenticated' });
    }
  },

  setCustomer: (customer) => set({ customer, status: 'authenticated' }),
  clearCustomer: () => set({ customer: null, status: 'unauthenticated' }),
}));