import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';

interface ProductGridSkeletonProps {
  count?: number;
  /** Set false when this grid sits inside a larger skeleton that already announces "Loading". */
  announce?: boolean;
}

export function ProductGridSkeleton({ count = 8, announce = true }: ProductGridSkeletonProps) {
  const grid = (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        // Index as key is fine here — this is a fixed-length, never-reordered skeleton list,
        // not real data with identity.
        <div key={index}>
          <Skeleton className="aspect-[3/4] w-full" />
          <Skeleton className="mt-3 h-3 w-1/3 rounded" />
          <Skeleton className="mt-2 h-4 w-4/5 rounded" />
          <Skeleton className="mt-2 h-4 w-1/4 rounded" />
        </div>
      ))}
    </div>
  );

  return announce ? <LoadingRegion label="Loading products">{grid}</LoadingRegion> : grid;
}
