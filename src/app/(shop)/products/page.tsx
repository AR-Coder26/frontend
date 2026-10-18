import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getBrands } from '@/lib/api/brands';
import { ProductFilters } from '@/components/filters/ProductFilters';
import { ProductListingResults } from '@/components/product/ProductListingResults';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { SeoCopy } from '@/components/seo/SeoCopy';
import { buildPageMetadata, getListingSeoState, withPageSuffix } from '@/lib/seo';
import { PRODUCTS_SEO } from '@/lib/seoContent';
import { getCopyVars } from '@/lib/seoCopyVars';
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

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const { canonicalPath, noindex, page } = getListingSeoState('/products', await searchParams);
  return buildPageMetadata({
    title: withPageSuffix(PRODUCTS_SEO.title, page),
    description: PRODUCTS_SEO.description,
    path: canonicalPath,
    noindex,
  });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolved = await searchParams;
  const [brands, vars] = await Promise.all([getBrands(), getCopyVars()]);
  const { isCleanFirstPage } = getListingSeoState('/products', resolved);

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
      <Breadcrumbs items={[{ name: 'All Suits', href: '/products' }]} />
      <h1 className="font-display text-2xl text-foreground">{PRODUCTS_SEO.h1}</h1>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:gap-8">
        <ProductFilters brands={brands} />
        <div className="min-w-0 flex-1">
          <Suspense key={resultsKey} fallback={<ProductGridSkeleton />}>
            <ProductListingResults params={params} />
          </Suspense>
        </div>
      </div>

      {/* Body copy only on the clean first page — not on filtered / paginated views. */}
      {isCleanFirstPage && <SeoCopy blocks={PRODUCTS_SEO.blocks} vars={vars} />}
    </div>
  );
}
