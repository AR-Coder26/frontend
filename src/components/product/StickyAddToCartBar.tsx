import { Button } from '@/components/ui/button';
import { formatPKR } from '@/lib/utils';

interface StickyAddToCartBarProps {
  price: number | null;
  disabled: boolean;
  label: string;
  onAddToCart: () => void;
}

/** Always visible at the bottom on mobile (not scroll-triggered) — a deliberately simple,
 *  well-established mobile e-commerce pattern rather than adding IntersectionObserver
 *  complexity for a marginal UX gain. Hidden entirely on desktop; the inline quantity/cart
 *  row in ProductPurchasePanel covers that breakpoint. */
export function StickyAddToCartBar({
  price,
  disabled,
  label,
  onAddToCart,
}: StickyAddToCartBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-border bg-card p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:hidden">
      <span className="font-display text-base text-foreground">
        {price !== null ? formatPKR(price) : '—'}
      </span>
      <Button className="flex-1" disabled={disabled} onClick={onAddToCart}>
        {label}
      </Button>
    </div>
  );
}