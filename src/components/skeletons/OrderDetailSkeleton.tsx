import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';

/** Placeholder for OrderDetailCard while a guest order lookup is in flight. */
export function OrderDetailSkeleton() {
  return (
    <LoadingRegion label="Looking up your order" className="rounded-md border border-border p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="mt-4 divide-y divide-border border-t border-border">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex justify-between gap-3 py-2.5">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-40 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <Skeleton className="h-3 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </LoadingRegion>
  );
}
