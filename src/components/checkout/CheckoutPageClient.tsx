'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import { CartEmptyState } from '@/components/cart/CartEmptyState';
import { CheckoutForm } from './CheckoutForm';
import { OrderConfirmation } from './OrderConfirmation';
import type { Order, StoreSettingsPublic } from '@/types';

interface CheckoutPageClientProps {
  storeSettings: StoreSettingsPublic;
}

export function CheckoutPageClient({ storeSettings }: CheckoutPageClientProps) {
  const hasMounted = useHasMounted();
  const items = useCartStore((state) => state.items);
  const selectedCount = items.filter((i) => i.isSelected).length;
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!hasMounted) {
    return <div className="container py-8" />;
  }

  if (placedOrder) {
    return (
      <div className="container py-8">
        <OrderConfirmation order={placedOrder} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="font-display text-2xl text-foreground">Checkout</h1>
        <CartEmptyState />
      </div>
    );
  }

  // Distinct from an EMPTY cart: there IS something in the cart, it's just all deselected
  // (e.g. left over from a previous selective checkout, or someone unchecked everything on
  // the cart page then came here directly by URL). CartEmptyState's "browse products" framing
  // would be misleading here — the fix is "go select something," not "go find something."
  if (selectedCount === 0) {
    return (
      <div className="container py-8">
        <h1 className="font-display text-2xl text-foreground">Checkout</h1>
        <div className="mt-6 rounded-md border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing is selected for checkout right now.
          </p>
          <Link href="/cart" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            Go to your cart and select items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl text-foreground">Checkout</h1>
      <CheckoutForm storeSettings={storeSettings} onOrderPlaced={setPlacedOrder} />
    </div>
  );
}