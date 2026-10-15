'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { QuantityStepper } from '@/components/product/QuantityStepper';
import { useCartStore } from '@/store/cartStore';
import { formatPKR } from '@/lib/utils';
import type { CartItem } from '@/store/cartStore';

interface CartLineItemProps {
  item: CartItem;
  /** 'compact' = drawer (smaller thumbnail, tighter spacing). 'default' = full /cart page. */
  variant?: 'default' | 'compact';
}

export function CartLineItem({ item, variant = 'default' }: CartLineItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const toggleSelected = useCartStore((state) => state.toggleSelected);
  const isCompact = variant === 'compact';

  return (
    <div className={`flex gap-3 ${isCompact ? 'py-3' : 'py-4'} ${item.isSelected ? '' : 'opacity-50'}`}>
      <input
        type="checkbox"
        checked={item.isSelected}
        onChange={() => toggleSelected(item.variantId)}
        aria-label={item.isSelected ? 'Included in checkout' : 'Excluded from checkout'}
        className="mt-1 h-4 w-4 shrink-0 accent-primary"
      />

      <Link
        href={`/products/${item.productSlug}`}
        className={`relative shrink-0 overflow-hidden rounded-md bg-secondary ${
          isCompact ? 'h-16 w-16' : 'h-20 w-20 sm:h-24 sm:w-24'
        }`}
      >
        {item.image && (
          <Image
            src={item.image}
            alt={item.productName}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${item.productSlug}`}
              className="line-clamp-2 break-words text-sm font-medium text-foreground hover:underline"
            >
              {item.productName}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.color} · {item.size} · <span className="capitalize">{item.fabricStatus}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            aria-label="Remove item"
            className="-m-2 shrink-0 p-2 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <QuantityStepper
            value={item.quantity}
            max={item.maxStock}
            onChange={(quantity) => updateQuantity(item.variantId, quantity)}
            size="sm"
          />
          <span className="shrink-0 text-sm font-medium text-foreground">
            {formatPKR(item.unitPrice * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}