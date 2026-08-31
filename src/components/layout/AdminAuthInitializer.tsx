'use client';

import { useEffect } from 'react';
import { useAdminAuthStore } from '@/store/adminAuthStore';

/** Renders nothing — fires the one-time admin session check on mount. Mounted in the OUTER
 *  (admin)/admin/layout.tsx (not the protected one), so it runs for /admin/login too — that's
 *  what lets AdminLoginForm redirect an already-authenticated admin straight to the dashboard
 *  instead of showing them a login form. See adminAuthStore.ts for the full reasoning. */
export function AdminAuthInitializer() {
  const fetchCurrentAdmin = useAdminAuthStore((state) => state.fetchCurrentAdmin);

  useEffect(() => {
    fetchCurrentAdmin();
  }, [fetchCurrentAdmin]);

  return null;
}

