import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors ProductDetailInteractive: same grid, same gallery proportions (3:4 photo capped on
 * tablets), same purchase-panel rhythm, and the same sticky bar on screens below `lg` — so
 * when the real page streams in, nothing jumps.
 */
export function ProductDetailSkeleton() {
  return (
    <LoadingRegion label="Loading product" className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Gallery */}
      <div className="mx-auto w-full min-w-0 max-w-lg lg:max-w-none">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="mt-3 flex gap-2 overflow-hidden pb-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-16 shrink-0" />
          ))}
        </div>
      </div>

      {/* Purchase panel */}
      <div className="min-w-0 pb-28 lg:pb-0">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="mt-3 h-8 w-4/5 rounded" />
        <Skeleton className="mt-3 h-6 w-32 rounded" />

        <div className="mt-6 space-y-2">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-11/12 rounded" />
          <Skeleton className="h-3 w-3/5 rounded" />
        </div>

        <div className="mt-6">
          <Skeleton className="h-3 w-16 rounded" />
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Skeleton className="h-3 w-12 rounded" />
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-10" />
            ))}
          </div>
        </div>

        {/* Inline buy row — only exists from lg up, like the real one. */}
        <div className="mt-6 hidden items-center gap-3 lg:flex">
          <Skeleton className="h-11 w-28" />
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 w-11" />
        </div>

        <div className="mt-8 space-y-3 border-t border-border pt-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex justify-between gap-4">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Sticky bar placeholder below lg, matching StickyAddToCartBar's footprint. */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        <div className="mx-auto max-w-xl">
          <Skeleton className="mx-auto mb-2 h-5 w-24 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}
