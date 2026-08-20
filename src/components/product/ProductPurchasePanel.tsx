'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import { formatPKR } from '@/lib/utils';
import { StickyAddToCartBar } from './StickyAddToCartBar';
import { QuantityStepper } from './QuantityStepper';
import { ProductSpecs } from './ProductSpecs';
import { CustomStitchingNote } from './CustomStitchingNote';
import type { VariantSelection } from '@/hooks/useVariantSelection';
import type { Product } from '@/types';

interface ProductPurchasePanelProps {
  product: Product;
  selection: VariantSelection;
}

export function ProductPurchasePanel({ product, selection }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const hasMounted = useHasMounted();

  const addItem = useCartStore((state) => state.addItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product._id));
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const { selectedVariant } = selection;
  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;

  // Switching color/size/stitching can resolve to a DIFFERENT variant with less stock than
  // whatever quantity was previously dialed in — reset to 1 rather than silently leaving
  // quantity above the new variant's stock until the customer happens to touch the stepper.
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant?._id]);


  function handleAddToCart() {
    if (!selectedVariant || selectedVariant.stock === 0) return;

    addItem(
      {
        productId: product._id,
        variantId: selectedVariant._id,
        productSlug: product.slug,
        productName: product.name,
        image: selectedVariant.images[0]?.url ?? product.images[0]?.url ?? null,
        color: selectedVariant.color,
        size: selectedVariant.size,
        fabricStatus: selectedVariant.fabricStatus,
        unitPrice: selectedVariant.price,
        comparePrice: selectedVariant.comparePrice,
        maxStock: selectedVariant.stock,
      },
      quantity
    );

    toast.success('Added to cart', {
      description: `${product.name} — ${selectedVariant.color}, ${selectedVariant.size}`,
    });
    setQuantity(1);
  }

  function handleWishlistToggle() {
    toggleWishlist({
      productId: product._id,
      productSlug: product.slug,
      productName: product.name,
      image: product.images[0]?.url ?? null,
      minPrice: product.minPrice,
    });
  }

  return (
    <div className="pb-24 md:pb-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand.name}</p>
      <h1 className="mt-1 font-display text-2xl text-foreground sm:text-3xl">{product.name}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {selectedVariant ? (
          <>
            <span className="font-display text-xl text-foreground">
              {formatPKR(selectedVariant.price)}
            </span>
            {selectedVariant.comparePrice && selectedVariant.comparePrice > selectedVariant.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPKR(selectedVariant.comparePrice)}
              </span>
            )}
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            This combination isn&rsquo;t available
          </span>
        )}
        {product.discountPercentage > 0 && (
          <Badge variant="accent">{product.discountPercentage}% OFF</Badge>
        )}
      </div>

      {/* Color */}
      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          Color — <span className="normal-case text-foreground">{selection.selectedColor}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {selection.colors.map((color) => {
            const available = selection.isColorAvailable(color);
            const isSelected = selection.selectedColor === color;
            return (
              <button
                key={color}
                type="button"
                disabled={!available}
                onClick={() => selection.setSelectedColor(color)}
                aria-pressed={isSelected}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : available
                      ? 'border-border text-foreground/80 hover:border-primary'
                      : 'cursor-not-allowed border-border text-muted-foreground/50 line-through'
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      {selection.sizes.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selection.sizes.map((size) => {
              const available = selection.isSizeAvailable(size);
              const isSelected = selection.selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  disabled={!available}
                  onClick={() => selection.setSelectedSize(size)}
                  aria-pressed={isSelected}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : available
                        ? 'border-border text-foreground/80 hover:border-primary'
                        : 'cursor-not-allowed border-border text-muted-foreground/40'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stitched / Unstitched — only rendered when this product genuinely offers more than
          one, per "selector must only show options that actually exist for that product." */}
      {selection.fabricStatuses.length > 1 && (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Stitching</p>
          <div className="mt-2 flex gap-2">
            {selection.fabricStatuses.map((status) => {
              const available = selection.isFabricStatusAvailable(status);
              const isSelected = selection.selectedFabricStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  disabled={!available}
                  onClick={() => selection.setSelectedFabricStatus(status)}
                  aria-pressed={isSelected}
                  className={`rounded-full border px-4 py-1.5 text-xs capitalize transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : available
                        ? 'border-border text-foreground/80 hover:border-primary'
                        : 'cursor-not-allowed border-border text-muted-foreground/40'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock feedback — condition checks `selectedVariant` directly (not the separately
          computed `isOutOfStock` boolean) so TypeScript can narrow it to non-undefined in
          the branches below; referencing `isOutOfStock` here instead would make
          `selectedVariant.stock` a type error. */}
      <div className="mt-4">
        {!selectedVariant || selectedVariant.stock === 0 ? (
          <p className="text-sm font-medium text-destructive">Out of Stock</p>
        ) : selectedVariant.stock <= 5 ? (
          <p className="text-sm font-medium text-warning">
            Only {selectedVariant.stock} left in stock
          </p>
        ) : (
          <p className="text-sm text-success">In Stock</p>
        )}
      </div>

      {/* Desktop quantity + add to cart — hidden on mobile, StickyAddToCartBar covers that
          breakpoint instead. */}
      <div className="mt-6 hidden items-center gap-3 md:flex">
        <QuantityStepper
          value={quantity}
          max={selectedVariant?.stock ?? 1}
          onChange={setQuantity}
        />

        <Button size="lg" className="flex-1" disabled={isOutOfStock} onClick={handleAddToCart}>
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>

        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-input text-foreground hover:bg-secondary"
        >
          <Heart className="h-5 w-5" fill={hasMounted && isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <p className="whitespace-pre-line text-sm text-muted-foreground">{product.description}</p>
      </div>

      <ProductSpecs product={product} />

      {product.isCustomStitchingAvailable && <CustomStitchingNote productName={product.name} />}

      <StickyAddToCartBar
        price={selectedVariant?.price ?? null}
        disabled={isOutOfStock}
        label={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}