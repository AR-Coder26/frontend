// src/components/auth/OwnerOnly.tsx
'use client';

import type { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAdminAuthStore } from '@/store/adminAuthStore';

/**
 * Renders children only for the store owner (role "admin"). Staff see a short notice and the
 * children are never mounted, so no owner-only request is even attempted.
 * This is a convenience, not security: every owner-only API route also enforces the role server-side.
 */
export function OwnerOnly({ children }: { children: ReactNode }) {
  const role = useAdminAuthStore((s) => s.admin?.role);
  if (role === 'admin') return <>{children}</>;
  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg border border-border bg-card p-6 text-center">
      <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
      <h2 className="mt-3 text-base font-semibold text-foreground">Owner access only</h2>
      <p className="mt-1 text-sm text-muted-foreground">This page is available to the store owner account.</p>
    </div>
  );
}
