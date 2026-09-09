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
  const getSelectedSubtotal = useCartStore((state) => state.getSelectedSubtotal);
  const selectAll = useCartStore((state) => state.selectAll);
  const deselectAll = useCartStore((state) => state.deselectAll);

  // Same SSR/hydration guard as everywhere else persisted cart state renders (see
  // useHasMounted.ts) — never show real contents before the client has rehydrated.
  const safeItems = hasMounted ? items : [];
  const selectedSubtotal = hasMounted ? getSelectedSubtotal() : 0;
  const selectedCount = safeItems.filter((i) => i.isSelected).length;
  const allSelected = safeItems.length > 0 && selectedCount === safeItems.length;

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
            <label className="flex items-center gap-2 border-b border-border pb-3 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => (allSelected ? deselectAll() : selectAll())}
                className="h-4 w-4 accent-primary"
              />
              Select all ({selectedCount} of {safeItems.length} selected)
            </label>

            <div className="flex-1 divide-y divide-border overflow-y-auto">
              {safeItems.map((item) => (
                <CartLineItem key={item.variantId} item={item} variant="compact" />
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display text-base text-foreground">
                  {formatPKR(selectedSubtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Delivery calculated at checkout.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {/* Deliberately NOT `<Button asChild disabled><Link .../></Button>` — asChild
                    merges props onto the underlying <a>, and `disabled` isn't a real HTML
                    attribute for anchors, so it wouldn't actually block the click. Rendering
                    a genuine disabled <button> (no Link/asChild at all) when nothing is
                    selected is the only way this is actually unclickable, not just styled to
                    look that way. */}
                {selectedCount === 0 ? (
                  <Button size="lg" disabled>
                    Select items to checkout
                  </Button>
                ) : (
                  <Button asChild size="lg" onClick={closeDrawer}>
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                )}
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