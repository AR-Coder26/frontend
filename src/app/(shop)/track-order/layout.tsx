import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NOINDEX_METADATA } from '@/lib/seo';

// Transactional / personal page — keep it out of search results.
export const metadata: Metadata = NOINDEX_METADATA;

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
