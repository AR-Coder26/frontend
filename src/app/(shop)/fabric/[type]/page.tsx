import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts } from '@/lib/api/products';
import { ProductListingResults } from '@/components/product/ProductListingResults';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { SeoCopy } from '@/components/seo/SeoCopy';
import {
  buildPageMetadata,
  FABRIC_SLUGS,
  getListingSeoState,
  MIN_PRODUCTS_FOR_INDEXED_HUB,
  withPageSuffix,
} from '@/lib/seo';
import { FABRIC_SEO } from '@/lib/seoContent';
import { getCopyVars } from '@/lib/seoCopyVars';
import type { ProductListParams } from '@/lib/api/products';

interface FabricPageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
  searchParams,
}: FabricPageProps): Promise<Metadata> {
  const { type } = await params;
  const fabricType = FABRIC_SLUGS[type];
  const seo = FABRIC_SEO[type];
  if (!fabricType || !seo) notFound();

  const { canonicalPath, noindex, page } = getListingSeoState(
    `/fabric/${type}`,
    await searchParams
  );

  // Thin-page guard: a hub with fewer than MIN_PRODUCTS_FOR_INDEXED_HUB products stays out of
  // Google until the catalogue grows. It switches to indexable automatically.
  let isThin = true;
  try {
    const { total } = await getProducts({ fabricType, limit: 1 });
    isThin = total < MIN_PRODUCTS_FOR_INDEXED_HUB;
  } catch {
    isThin = true;
  }

  return buildPageMetadata({
    title: withPageSuffix(seo.title, page),
    description: seo.description,
    path: canonicalPath,
    noindex: noindex || isThin,
  });
}

export default async function FabricPage({ params, searchParams }: FabricPageProps) {
  const { type } = await params;
  const resolved = await searchParams;
  const fabricType = FABRIC_SLUGS[type];
  const seo = FABRIC_SEO[type];
  if (!fabricType || !seo) notFound();

  const vars = await getCopyVars();
  const { isCleanFirstPage } = getListingSeoState(`/fabric/${type}`, resolved);

  const listParams: ProductListParams = {
    fabricType,
    sort: 'newest',
    page: Number(getParam(resolved.page)) || 1,
  };
  const resultsKey = JSON.stringify(listParams);

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ name: seo.h1, href: `/fabric/${type}` }]} />
      <h1 className="font-display text-2xl text-foreground">{seo.h1}</h1>

      <div className="mt-6">
        <Suspense key={resultsKey} fallback={<ProductGridSkeleton />}>
          <ProductListingResults params={listParams} />
        </Suspense>
      </div>

      {isCleanFirstPage && <SeoCopy blocks={seo.blocks} vars={vars} />}
    </div>
  );
}
