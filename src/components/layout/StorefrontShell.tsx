import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppFAB } from './WhatsAppFAB';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CustomerAuthInitializer } from './CustomerAuthInitializer';

/**
 * The customer-facing chrome — used by (shop) and (account), and ONLY those. (admin) is a
 * completely different surface (sidebar nav, no WhatsApp FAB, no public Header/Footer) and
 * gets its own shell component in a later phase, not this one.
 */
export function StorefrontShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFAB />
      <CartDrawer />
      <CustomerAuthInitializer />
    </div>
  );
}