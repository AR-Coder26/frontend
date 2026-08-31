'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import { getProductBySlug } from '@/lib/api/products';
import { ApiError } from '@/lib/api/client';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import type { Product } from '@/types';

export default function WishlistPage() {
  const hasMounted = useHasMounted();
  // NEVER call `.map()`/`.filter()`/etc. directly inside a Zustand selector — each one
  // returns a brand-new array reference on every single render, even when the underlying
  // data hasn't changed. React's useSyncExternalStore (which Zustand's hook is built on)
  // detects that as "the snapshot changed" every time, which either throws "The result of
  // getSnapshot should be cached to avoid an infinite loop" or actually triggers one
  // ("Maximum update depth exceeded"). Select the raw, STABLE `items` reference instead, and
  // derive anything else from it locally with useMemo.
  const items = useWishlistStore((state) => state.items);
  const wishlistedIds = useMemo(() => items.map((item) => item.productId), [items]);
  const [fetchedProducts, setFetchedProducts] = useState<Product[] | null>(null);

  /**
   * Fetches the wishlist's products LIVE, exactly once per page load — never trusts the
   * stored `minPrice`/`image` snapshot for what's actually rendered (see wishlistStore.ts's
   * own comment on why: it's a bookmark list, never a source of truth for price/stock).
   *
   * Deliberately reads a one-time snapshot via `getState()` here rather than reacting to the
   * live `items` array, so removing a heart on THIS page doesn't re-trigger this whole fetch
   * (which would otherwise loop once for every stale/removed item). Instant removal from the
   * visible grid is instead handled by the reactive filter below, which needs no re-fetch.
   *
   * Each request's success/failure handler closes over its own `item` directly, rather than
   * looking it up afterwards by array index — no risk of an out-of-bounds/undefined access
   * even in principle, so nothing here needs `noUncheckedIndexedAccess` silenced with `?.`
   * or a non-null assertion.
   */
  useEffect(() => {
    if (!hasMounted) return;

    const snapshot = useWishlistStore.getState().items;
    if (snapshot.length === 0) {
      setFetchedProducts([]);
      return;
    }

    let cancelled = false;

    Promise.all(
      snapshot.map((item) =>
        getProductBySlug(item.productSlug)
          .then((product) => ({ product, item }))
          .catch((error) => {
            if (error instanceof ApiError && error.statusCode === 404) {
              // Product was deleted or deactivated since it was saved — quietly drop it
              // rather than showing a broken card forever.
              useWishlistStore.getState().removeItem(item.productId);
            }
            return null;
          })
      )
    ).then((results) => {
      if (cancelled) return;
      const live = results
        .filter((result): result is { product: Product; item: (typeof snapshot)[number] } =>
          Boolean(result)
        )
        .map((result) => result.product);
      setFetchedProducts(live);
    });

    return () => {
      cancelled = true;
    };
  }, [hasMounted]);

  // Reactive filter — un-hearting something right here on this page removes it from view
  // immediately, no re-fetch needed.
  const visibleProducts = (fetchedProducts ?? []).filter((product) =>
    wishlistedIds.includes(product._id)
  );

  if (!hasMounted || fetchedProducts === null) {
    return (
      <div className="container py-8">
        <h1 className="font-display text-2xl text-foreground">Wishlist</h1>
        <div className="mt-6">
          <ProductGridSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl text-foreground">Wishlist</h1>
      <div className="mt-6">
        <ProductGrid products={visibleProducts} />
      </div>
    </div>
  );
}