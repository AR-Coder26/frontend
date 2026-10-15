import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';

/**
 * Shown while the persisted cart is being read from localStorage (the page cannot know the
 * contents on the server). It used to render an empty box, which made the page jump when the
 * real cart appeared. The heading is real text — it never changes — so only the content area
 * is a placeholder.
 */
export function CartSkeleton() {
  return (
    <LoadingRegion label="Loading your cart" className="container py-8">
      <h1 className="font-display text-2xl text-foreground">Your Cart</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3 py-4">
                <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded-sm" />
                <Skeleton className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-4/5 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-fit min-w-0 rounded-md border border-border p-4 sm:p-5">
          <Skeleton className="h-5 w-32 rounded" />
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          </div>
          <Skeleton className="mt-5 h-11 w-full" />
        </div>
      </div>
    </LoadingRegion>
  );
}
