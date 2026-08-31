'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import type { ReactNode } from 'react';

interface RequireAdminAuthProps {
  children: ReactNode;
}

/**
 * Deliberately reuses RequireCustomerAuth's exact shape (per PROJECT_STATE_FRONTEND.md
 * §11 item 2b) — only the store and redirect target differ:
 *   - reads useAdminAuthStore instead of useCustomerAuthStore
 *   - redirects to /admin/login instead of /login
 *
 * This must ONLY wrap the (protected) route group, never (admin)/admin/layout.tsx itself —
 * /admin/login is a SIBLING of (protected), not a child of it, specifically so this guard
 * never wraps the login page (the same redirect-loop hazard documented for the customer
 * account nesting: unauthenticated -> /admin/login -> guard redirects to /admin/login again).
 */
export function RequireAdminAuth({ children }: RequireAdminAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAdminAuthStore((state) => state.status);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status === 'idle' || status === 'loading') {
    return <div className="py-16 text-center text-sm text-neutral-500">Loading…</div>;
  }

  if (status === 'unauthenticated') {
    // The redirect above is already in flight — render nothing rather than flash protected
    // admin content (or a "please log in" placeholder) that's about to be replaced anyway.
    return null;
  }

  return <>{children}</>;
}
