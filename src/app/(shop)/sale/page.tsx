import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/api/products';
import { ProductListingResults } from '@/components/product/ProductListingResults';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { SeoCopy } from '@/components/seo/SeoCopy';
import {
  buildPageMetadata,
  getListingSeoState,
  SALE_DISCOUNT_PERCENT,
  withPageSuffix,
} from '@/lib/seo';
import { SALE_SEO } from '@/lib/seoContent';
import { getCopyVars } from '@/lib/seoCopyVars';
import type { ProductListParams } from '@/lib/api/products';

interface SalePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ searchParams }: SalePageProps): Promise<Metadata> {
  const { canonicalPath, noindex, page } = getListingSeoState('/sale', await searchParams);

  // If nothing is on sale right now, the page is empty — keep it out of the index rather
  // than serving Google a "30% Off" title over a page with no products.
  let isEmpty = false;
  try {
    const { total } = await getProducts({ discount: SALE_DISCOUNT_PERCENT, limit: 1 });
    isEmpty = total === 0;
  } catch {
    isEmpty = false;
  }

  return buildPageMetadata({
    title: withPageSuffix(SALE_SEO.title, page),
    description: SALE_SEO.description,
    path: canonicalPath,
    noindex: noindex || isEmpty,
  });
}

export default async function SalePage({ searchParams }: SalePageProps) {
  const resolved = await searchParams;
  const vars = await getCopyVars();
  const { isCleanFirstPage } = getListingSeoState('/sale', resolved);

  // discount: 30 uses the backend's $gte semantics (product.controller.js) — this shows
  // everything discounted 30% OR MORE, not just exactly 30%.
  const params: ProductListParams = {
    discount: SALE_DISCOUNT_PERCENT,
    sort: 'newest',
    page: Number(getParam(resolved.page)) || 1,
  };

  const resultsKey = JSON.stringify(params);

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ name: 'Sale', href: '/sale' }]} />
      <h1 className="font-display text-2xl text-foreground">{SALE_SEO.h1}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything here is discounted {SALE_DISCOUNT_PERCENT}% or more.
      </p>

      <div className="mt-6">
        <Suspense key={resultsKey} fallback={<ProductGridSkeleton />}>
          <ProductListingResults params={params} />
        </Suspense>
      </div>

      {isCleanFirstPage && <SeoCopy blocks={SALE_SEO.blocks} vars={vars} />}
    </div>
  );
}
