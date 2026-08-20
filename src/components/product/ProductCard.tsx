'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useWishlistStore } from '@/store/wishlistStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import { formatPKR } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasMounted = useHasMounted();
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product._id));
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const coverImage = product.images[0]?.url ?? product.variants[0]?.images[0]?.url ?? null;
  const hoverImage = product.images[1]?.url ?? null;

  const priceLabel =
    product.minPrice === product.maxPrice
      ? formatPKR(product.minPrice)
      : `${formatPKR(product.minPrice)} – ${formatPKR(product.maxPrice)}`;

  return (
    <div className="group relative">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="skeleton relative aspect-[3/4] overflow-hidden rounded-md bg-secondary">
          {coverImage && (
            <>
              <Image
                src={coverImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={`object-cover transition-opacity duration-500 ease-out ${
                  hoverImage ? 'group-hover:opacity-0' : ''
                }`}
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                />
              )}
            </>
          )}

          {product.isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <span className="text-xs font-medium uppercase tracking-wide text-foreground">
                Out of Stock
              </span>
            </div>
          )}

          {/* Marketing % is intentionally the admin-set product.discountPercentage, not
              something derived from any single variant's comparePrice — see the note above
              this file in chat for why those two numbers aren't guaranteed to agree. */}
          {product.discountPercentage > 0 && (
            <Badge variant="accent" className="absolute left-2 top-2">
              {product.discountPercentage}% OFF
            </Badge>
          )}
        </div>

        <div className="mt-3 space-y-0.5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.brand.name}
          </p>
          <h3 className="line-clamp-1 text-sm text-foreground">{product.name}</h3>
          <p className="font-display text-sm text-foreground">{priceLabel}</p>
        </div>
      </Link>

      <button
        type="button"
        onClick={() =>
          toggleWishlist({
            productId: product._id,
            productSlug: product.slug,
            productName: product.name,
            image: coverImage,
            minPrice: product.minPrice,
          })
        }
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm transition-transform hover:scale-105"
      >
        <Heart className="h-4 w-4" fill={hasMounted && isWishlisted ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}