'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { CartEmptyState } from '@/components/cart/CartEmptyState';
import { Button } from '@/components/ui/button';
import { formatPKR } from '@/lib/utils';

export default function CartPage() {
  const hasMounted = useHasMounted();
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  // Same "render nothing until hydrated" shell the rest of the app uses for persisted cart
  // state — see useHasMounted.ts.
  if (!hasMounted) {
    return <div className="container py-8" />;
  }

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl text-foreground">Your Cart</h1>

      {items.length === 0 ? (
        <CartEmptyState />
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="divide-y divide-border lg:col-span-2">
            {items.map((item) => (
              <CartLineItem key={item.variantId} item={item} />
            ))}
          </div>

          <div className="h-fit rounded-md border border-border p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-lg text-foreground">
                {formatPKR(getSubtotal())}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Delivery is calculated at checkout based on your city.
            </p>
            <Button asChild size="lg" className="mt-4 w-full">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}