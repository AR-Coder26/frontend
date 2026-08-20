
import { formatPKR } from '@/lib/utils';
import { isKarachiCity } from '@/lib/constants';
import type { CartItem } from '@/store/cartStore';
import type { StoreSettingsPublic } from '@/types';

interface OrderSummaryProps {
  items: CartItem[];
  city: string;
  storeSettings: StoreSettingsPublic;
}

export function OrderSummary({ items, city, storeSettings }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const hasEnteredCity = city.trim().length > 0;
  const estimatedDelivery = hasEnteredCity
    ? isKarachiCity(city)
      ? 0
      : storeSettings.deliveryFlatRateNonKarachi
    : null;
  const isBelowMinimum = storeSettings.minOrderValue > 0 && subtotal < storeSettings.minOrderValue;

  return (
    <div className="rounded-md border border-border p-5">
      <h2 className="font-display text-lg text-foreground">Order Summary</h2>

      <div className="mt-3 max-h-64 space-y-3 overflow-y-auto">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center justify-between gap-2 text-xs">
            <span className="line-clamp-1 text-foreground">
              {item.productName} × {item.quantity}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {formatPKR(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{formatPKR(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span className="text-foreground">
            {estimatedDelivery === null
              ? 'Enter your city'
              : estimatedDelivery === 0
                ? 'Free'
                : formatPKR(estimatedDelivery)}
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-1.5 font-display text-base">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">{formatPKR(subtotal + (estimatedDelivery ?? 0))}</span>
        </div>
      </div>

      {/* The backend HARD-REJECTS (400) an order below minOrderValue — this isn't just a
          display hint, CheckoutForm actually disables the submit button on this same
          condition, so nobody hits that rejection after filling in the whole form. */}
      {isBelowMinimum && (
        <p className="mt-3 text-xs text-warning">
          Minimum order value is {formatPKR(storeSettings.minOrderValue)}.
        </p>
      )}
    </div>
  );
}