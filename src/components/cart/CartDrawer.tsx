'use client';

import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CartLineItem } from './CartLineItem';
import { CartEmptyState } from './CartEmptyState';
import { useCartStore } from '@/store/cartStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import { formatPKR } from '@/lib/utils';

/**
 * Rendered once, globally, inside StorefrontShell — entirely driven by cartStore's
 * `isDrawerOpen`/`openDrawer`/`closeDrawer`, which is why nothing else in the app needs to
 * import this component directly. `addItem()` in cartStore.ts already sets
 * `isDrawerOpen: true` on every add, so this opens automatically the moment someone adds
 * something from the PDP — no wiring needed there.
 */
export function CartDrawer() {
  const hasMounted = useHasMounted();
  const items = useCartStore((state) => state.items);
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  // Same SSR/hydration guard as everywhere else persisted cart state renders (see
  // useHasMounted.ts) — never show real contents before the client has rehydrated.
  const safeItems = hasMounted ? items : [];
  const subtotal = hasMounted ? getSubtotal() : 0;

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart{safeItems.length > 0 && ` (${safeItems.length})`}</SheetTitle>
        </SheetHeader>

        {safeItems.length === 0 ? (
          <CartEmptyState />
        ) : (
          <>
            <div className="flex-1 divide-y divide-border overflow-y-auto">
              {safeItems.map((item) => (
                <CartLineItem key={item.variantId} item={item} variant="compact" />
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display text-base text-foreground">
                  {formatPKR(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Delivery calculated at checkout.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild size="lg" onClick={closeDrawer}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <Button asChild variant="outline" onClick={closeDrawer}>
                  <Link href="/cart">View Cart</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}