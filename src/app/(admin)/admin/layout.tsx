import type { ReactNode } from 'react';
import { AdminAuthInitializer } from '@/components/layout/AdminAuthInitializer';

/**
 * OUTER admin layout — intentionally minimal, no sidebar, no auth guard. It wraps BOTH
 * /admin/login and the whole (protected) tree, and its only job is mounting
 * AdminAuthInitializer once so the session-check fires regardless of which of those two a
 * person lands on first (mirrors StorefrontShell mounting CustomerAuthInitializer once for
 * the whole storefront, including /login and /register).
 *
 * The sidebar/header chrome that used to live here has moved to
 * (admin)/admin/(protected)/layout.tsx, which is the one wrapped in RequireAdminAuth. Keeping
 * the guard OFF this outer layout is what stops /admin/login itself from being wrapped by the
 * guard — see RequireAdminAuth.tsx's comment for why that matters (redirect-loop hazard).
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminAuthInitializer />
      {children}
    </>
  );
}
