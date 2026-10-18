import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCategoryBySlug } from '@/lib/api/categories';
import { getBrands } from '@/lib/api/brands';
import { ApiError } from '@/lib/api/client';
import { ProductFilters } from '@/components/filters/ProductFilters';
import { ProductListingResults } from '@/components/product/ProductListingResults';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { SeoCopy } from '@/components/seo/SeoCopy';
import { buildPageMetadata, getListingSeoState, truncate, withPageSuffix } from '@/lib/seo';
import { CATEGORY_SEO } from '@/lib/seoContent';
import { getCopyVars } from '@/lib/seoCopyVars';
import type { ProductListParams } from '@/lib/api/products';
import type { FabricStatus, FabricType, Size } from '@/types';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function fetchCategoryOr404(slug: string) {
  try {
    return await getCategoryBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategoryOr404(slug);
  const seo = CATEGORY_SEO[slug];
  const { canonicalPath, noindex, page } = getListingSeoState(
    `/category/${slug}`,
    await searchParams
  );

  // Hand-written copy for the known categories; a safe generated fallback for any new one.
  const title = seo?.title ?? `${category.name} for Women Online in Pakistan | Brandox`;
  const description =
    seo?.description ??
    truncate(
      category.description ||
        `Shop ${category.name} online. Cash on Delivery, free delivery in Karachi.`,
      155
    );

  return buildPageMetadata({
    title: withPageSuffix(title, page),
    description,
    path: canonicalPath,
    noindex,
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const [category, brands, vars] = await Promise.all([
    fetchCategoryOr404(slug),
    getBrands(),
    getCopyVars(),
  ]);
  const seo = CATEGORY_SEO[slug];
  const { isCleanFirstPage } = getListingSeoState(`/category/${slug}`, resolvedSearchParams);

  const filterParams: ProductListParams = {
    category: slug,
    fabricType: getParam(resolvedSearchParams.fabricType) as FabricType | undefined,
    brand: getParam(resolvedSearchParams.brand),
    fabricStatus: getParam(resolvedSearchParams.fabricStatus) as FabricStatus | undefined,
    size: getParam(resolvedSearchParams.size) as Size | undefined,
    sort: (getParam(resolvedSearchParams.sort) as 'newest' | 'oldest' | undefined) ?? 'newest',
    page: Number(getParam(resolvedSearchParams.page)) || 1,
  };

  const resultsKey = JSON.stringify(filterParams);

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ name: category.name, href: `/category/${slug}` }]} />
      <h1 className="font-display text-2xl text-foreground">{seo?.h1 ?? category.name}</h1>
      {category.description && (
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{category.description}</p>
      )}

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:gap-8">
        <ProductFilters brands={brands} />
        <div className="min-w-0 flex-1">
          <Suspense key={resultsKey} fallback={<ProductGridSkeleton />}>
            <ProductListingResults params={filterParams} />
          </Suspense>
        </div>
      </div>

      {/* Body copy only on the clean first page, and only for categories that have copy. */}
      {seo && isCleanFirstPage && <SeoCopy blocks={seo.blocks} vars={vars} />}
    </div>
  );
}
