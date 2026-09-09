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
  const getSelectedSubtotal = useCartStore((state) => state.getSelectedSubtotal);
  const selectAll = useCartStore((state) => state.selectAll);
  const deselectAll = useCartStore((state) => state.deselectAll);

  // Same "render nothing until hydrated" shell the rest of the app uses for persisted cart
  // state — see useHasMounted.ts.
  if (!hasMounted) {
    return <div className="container py-8" />;
  }

  const selectedCount = items.filter((i) => i.isSelected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl text-foreground">Your Cart</h1>

      {items.length === 0 ? (
        <CartEmptyState />
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className="flex items-center gap-2 border-b border-border pb-3 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => (allSelected ? deselectAll() : selectAll())}
                className="h-4 w-4 accent-primary"
              />
              Select all ({selectedCount} of {items.length} selected)
            </label>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <CartLineItem key={item.variantId} item={item} />
              ))}
            </div>
          </div>

          <div className="h-fit rounded-md border border-border p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-lg text-foreground">
                {formatPKR(getSelectedSubtotal())}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Delivery is calculated at checkout based on your city.
              {selectedCount < items.length && ' Only selected items will be checked out.'}
            </p>
            {/* Same reasoning as CartDrawer.tsx: a real disabled <button>, not
                asChild+disabled on a <Link>, which wouldn't actually block navigation. */}
            {selectedCount === 0 ? (
              <Button size="lg" className="mt-4 w-full" disabled>
                Select items to checkout
              </Button>
            ) : (
              <Button asChild size="lg" className="mt-4 w-full">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            )}
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}