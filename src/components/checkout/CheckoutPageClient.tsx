'use client';

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

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl text-foreground">Checkout</h1>
      <CheckoutForm storeSettings={storeSettings} onOrderPlaced={setPlacedOrder} />
    </div>
  );
}