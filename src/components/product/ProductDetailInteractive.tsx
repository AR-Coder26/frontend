'use client';

import { useVariantSelection } from '@/hooks/useVariantSelection';
import { ProductGallery } from './ProductGallery';
import { ProductPurchasePanel } from './ProductPurchasePanel';
import type { Product } from '@/types';

interface ProductDetailInteractiveProps {
  product: Product;
}

/**
 * Owns the ONE shared piece of client state this whole page needs — which variant is
 * currently selected — via useVariantSelection, and hands it to both halves of the layout.
 * The gallery needs it to know which photos to show (a different color = different photos);
 * the purchase panel needs it for price/stock/the selector buttons themselves. Splitting
 * that state across two independent components would let them drift out of sync, so it
 * lives here once instead and both children just receive the result.
 */
export function ProductDetailInteractive({ product }: ProductDetailInteractiveProps) {
  const selection = useVariantSelection(product);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Keyed by selectedColor so the gallery remounts (resetting to its first photo)
          whenever the customer picks a different color — see ProductGallery's own comment
          on why this key is required, not optional. */}
      <ProductGallery
        key={selection.selectedColor}
        images={selection.displayImages}
        productName={product.name}
      />
      <ProductPurchasePanel product={product} selection={selection} />
    </div>
  );
}