// frontend/src/components/layout/CustomerAuthInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useCustomerAuthStore } from '@/store/customerAuthStore';

/** Renders nothing — just fires the one-time session check on mount so every storefront
 *  page gets an accurate customer auth state without each page remembering to trigger it
 *  itself. See customerAuthStore.ts for why this is a client-side check, not server-side. */
export function CustomerAuthInitializer() {
  const fetchCurrentCustomer = useCustomerAuthStore((state) => state.fetchCurrentCustomer);

  useEffect(() => {
    fetchCurrentCustomer();
  }, [fetchCurrentCustomer]);

  return null;
}