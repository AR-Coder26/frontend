import { Suspense } from 'react';
import { getBrands } from '@/lib/api/brands';
import { ProductFilters } from '@/components/filters/ProductFilters';
import { ProductListingResults } from '@/components/product/ProductListingResults';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import type { ProductListParams } from '@/lib/api/products';
import type { FabricStatus, FabricType, Size } from '@/types';

// Next.js 15 changed page props: `searchParams` is now a Promise you must await, not a
// plain object like in Next 14 and earlier.
interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolved = await searchParams;
  const brands = await getBrands();

  const params: ProductListParams = {
    fabricType: getParam(resolved.fabricType) as FabricType | undefined,
    brand: getParam(resolved.brand),
    fabricStatus: getParam(resolved.fabricStatus) as FabricStatus | undefined,
    size: getParam(resolved.size) as Size | undefined,
    search: getParam(resolved.search),
    sort: (getParam(resolved.sort) as 'newest' | 'oldest' | undefined) ?? 'newest',
    page: Number(getParam(resolved.page)) || 1,
  };

  // Keying Suspense by the serialized params forces a fresh skeleton per distinct filter
  // combination, instead of silently leaving the PREVIOUS filter's results on screen while
  // the new ones stream in — clearer feedback that the filter actually did something.
  const resultsKey = JSON.stringify(params);

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl text-foreground">All Products</h1>

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <ProductFilters brands={brands} />
        <div className="flex-1">
          <Suspense key={resultsKey} fallback={<ProductGridSkeleton />}>
            <ProductListingResults params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}