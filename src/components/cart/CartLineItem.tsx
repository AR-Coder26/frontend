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
  const isCompact = variant === 'compact';

  return (
    <div className={`flex gap-3 ${isCompact ? 'py-3' : 'py-4'}`}>
      <Link
        href={`/products/${item.productSlug}`}
        className={`relative shrink-0 overflow-hidden rounded-md bg-secondary ${
          isCompact ? 'h-16 w-16' : 'h-24 w-24'
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

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/products/${item.productSlug}`}
              className="line-clamp-1 text-sm font-medium text-foreground hover:underline"
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
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <QuantityStepper
            value={item.quantity}
            max={item.maxStock}
            onChange={(quantity) => updateQuantity(item.variantId, quantity)}
            size="sm"
          />
          <span className="text-sm font-medium text-foreground">
            {formatPKR(item.unitPrice * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}