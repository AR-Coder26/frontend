import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { LoadingRegion, Skeleton } from '@/components/ui/skeleton';

interface ListingPageSkeletonProps {
  /** A line of intro text under the title (category and sale pages have one). */
  description?: boolean;
  /** Round brand logo beside the title (brand pages). */
  avatar?: boolean;
  /** Filter column on md+ and filter button below it. The sale page has no filters. */
  filters?: boolean;
}

/**
 * Shared by /products, /category/[slug], /brand/[slug] and /sale. Their pages wait for the
 * category / brand / filter data BEFORE they can render anything, so without this the
 * browser just sits on the previous page after a tap. Layout mirrors those pages (title,
 * 224px filter column from md, grid on the right) so the swap-in doesn't shift.
 */
export function ListingPageSkeleton({
  description = false,
  avatar = false,
  filters = true,
}: ListingPageSkeletonProps) {
  return (
    <LoadingRegion label="Loading products" className="container py-8">
      <div className="flex items-center gap-4">
        {avatar && <Skeleton className="h-12 w-12 shrink-0 rounded-full" />}
        <Skeleton className="h-8 w-48 rounded" />
      </div>
      {description && <Skeleton className="mt-2 h-4 w-full max-w-md rounded" />}

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:gap-8">
        {filters && (
          <>
            <aside aria-hidden="true" className="hidden w-56 shrink-0 space-y-6 md:block">
              {Array.from({ length: 3 }).map((_, group) => (
                <div key={group} className="space-y-2.5">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
              ))}
            </aside>
            <Skeleton className="h-10 w-28 md:hidden" />
          </>
        )}
        <div className="min-w-0 flex-1">
          <ProductGridSkeleton announce={false} />
        </div>
      </div>
    </LoadingRegion>
  );
}
