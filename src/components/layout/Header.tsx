import { getCategories } from '@/lib/api/categories';
import { getPublicStoreSettings } from '@/lib/api/storeSettings';
import { HeaderNav } from './HeaderNav';

/**
 * Server Component: fetches live categories + store settings so the nav and the delivery
 * strip are always real backend data, never a hardcoded category list or a guessed delivery
 * fee. The actual mobile-menu/cart-count INTERACTIVITY lives in the client-only
 * <HeaderNav>, which receives this fetched data as plain props instead of re-fetching
 * itself — keeps the client bundle from needing its own copy of the categories API call.
 */
export async function Header() {
  const [categories, storeSettings] = await Promise.all([
    getCategories(),
    getPublicStoreSettings(),
  ]);

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="bg-primary px-4 py-2 text-center text-xs text-primary-foreground">
        Free delivery in Karachi
        {storeSettings.deliveryFlatRateNonKarachi > 0 && (
          <> · Rs. {storeSettings.deliveryFlatRateNonKarachi} delivery elsewhere</>
        )}
        {' · '}Cash on Delivery available
      </div>
      <HeaderNav categories={categories} />
    </header>
  );
}