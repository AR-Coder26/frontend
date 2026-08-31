import { Button } from '@/components/ui/button';
import { formatPKR } from '@/lib/utils';

interface StickyAddToCartBarProps {
  price: number | null;
  disabled: boolean;
  addToCartLabel: string;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

/** Always visible at the bottom on mobile (not scroll-triggered) — a deliberately simple,
 *  well-established mobile e-commerce pattern rather than adding IntersectionObserver
 *  complexity for a marginal UX gain. Hidden entirely on desktop; the inline quantity/cart
 *  row in ProductPurchasePanel covers that breakpoint. */
export function StickyAddToCartBar({
  price,
  disabled,
  addToCartLabel,
  onAddToCart,
  onBuyNow,
}: StickyAddToCartBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:hidden">
      <div className="mb-2 text-center font-display text-base text-foreground">
        {price !== null ? formatPKR(price) : '—'}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1" disabled={disabled} onClick={onAddToCart}>
          {addToCartLabel}
        </Button>
        <Button size="sm" className="flex-1" disabled={disabled} onClick={onBuyNow}>
          Buy Now
        </Button>
      </div>
    </div>
  );
}