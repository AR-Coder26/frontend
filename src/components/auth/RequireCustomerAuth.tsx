'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCustomerAuthStore } from '@/store/customerAuthStore';
import type { ReactNode } from 'react';

interface RequireCustomerAuthProps {
  children: ReactNode;
}

export function RequireCustomerAuth({ children }: RequireCustomerAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useCustomerAuthStore((state) => state.status);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status === 'idle' || status === 'loading') {
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (status === 'unauthenticated') {
    // The redirect above is already in flight — render nothing rather than flash "please
    // log in" content that's about to be replaced anyway.
    return null;
  }

  return <>{children}</>;
}