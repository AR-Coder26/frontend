export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { StorefrontShell } from '@/components/layout/StorefrontShell';
import { NOINDEX_METADATA } from '@/lib/seo';

// Login, register and the customer account area: never meant to appear in search results.
export const metadata: Metadata = NOINDEX_METADATA;

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <StorefrontShell>{children}</StorefrontShell>;
}
