import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';

/** Fallback for the "Shop by Category" tiles (same heading row + square tiles). */
export function CategoryTilesSkeleton() {
  return (
    <LoadingRegion label="Loading categories" className="container py-12">
      <Skeleton className="h-8 w-52 rounded" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square w-full" />
        ))}
      </div>
    </LoadingRegion>
  );
}

/** Fallback for the "New Arrivals" product row. */
export function NewArrivalsSkeleton() {
  return (
    <LoadingRegion label="Loading new arrivals" className="container py-12">
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-8 w-40 rounded" />
        <Skeleton className="h-4 w-14 rounded" />
      </div>
      <div className="mt-6">
        <ProductGridSkeleton announce={false} />
      </div>
    </LoadingRegion>
  );
}
