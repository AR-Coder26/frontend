import { Suspense } from 'react';
import { ProductListingResults } from '@/components/product/ProductListingResults';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import type { ProductListParams } from '@/lib/api/products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '30% Off',
};

interface SalePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SalePage({ searchParams }: SalePageProps) {
  const resolved = await searchParams;

  // discount: 30 uses the backend's $gte semantics (product.controller.js) — this shows
  // everything discounted 30% OR MORE, not just exactly 30%.
  const params: ProductListParams = {
    discount: 30,
    sort: 'newest',
    page: Number(getParam(resolved.page)) || 1,
  };

  const resultsKey = JSON.stringify(params);

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl text-foreground">30% Off</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything here is discounted 30% or more.
      </p>

      <div className="mt-6">
        <Suspense key={resultsKey} fallback={<ProductGridSkeleton />}>
          <ProductListingResults params={params} />
        </Suspense>
      </div>
    </div>
  );
}