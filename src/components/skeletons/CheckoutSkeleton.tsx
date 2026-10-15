import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-24 rounded" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/**
 * Shown (a) while the route fetches store settings and (b) while the persisted cart is read
 * from localStorage. Mirrors CheckoutForm: contact + address sections, payment options, and
 * the order-summary column that sits beside them from lg up.
 */
export function CheckoutSkeleton() {
  return (
    <LoadingRegion label="Loading checkout" className="container py-8">
      <h1 className="font-display text-2xl text-foreground">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div className="rounded-md border border-border p-4 sm:p-5">
            <Skeleton className="h-5 w-40 rounded" />
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
          </div>

          <div className="rounded-md border border-border p-4 sm:p-5">
            <Skeleton className="h-5 w-44 rounded" />
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
              <div className="sm:col-span-2">
                <FieldSkeleton />
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border p-4 sm:p-5">
            <Skeleton className="h-5 w-36 rounded" />
            <div className="mt-3 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="h-fit min-w-0 rounded-md border border-border p-4 sm:p-5 lg:sticky lg:top-24">
          <Skeleton className="h-5 w-32 rounded" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-16 w-16 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-4/5 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 border-t border-border pt-4">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          </div>
          <Skeleton className="mt-5 h-11 w-full" />
        </div>
      </div>
    </LoadingRegion>
  );
}
