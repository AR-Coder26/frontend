import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Image from 'next/image';
import { getBrandBySlug } from '@/lib/api/brands';
import { ApiError } from '@/lib/api/client';
import { ProductFilters } from '@/components/filters/ProductFilters';
import { ProductListingResults } from '@/components/product/ProductListingResults';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import type { ProductListParams } from '@/lib/api/products';
import type { FabricStatus, FabricType, Size } from '@/types';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function fetchBrandOr404(slug: string) {
  try {
    return await getBrandBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await fetchBrandOr404(slug);
  return { title: brand.name };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const brand = await fetchBrandOr404(slug);

  const filterParams: ProductListParams = {
    brand: slug,
    fabricType: getParam(resolvedSearchParams.fabricType) as FabricType | undefined,
    fabricStatus: getParam(resolvedSearchParams.fabricStatus) as FabricStatus | undefined,
    size: getParam(resolvedSearchParams.size) as Size | undefined,
    sort: (getParam(resolvedSearchParams.sort) as 'newest' | 'oldest' | undefined) ?? 'newest',
    page: Number(getParam(resolvedSearchParams.page)) || 1,
  };

  const resultsKey = JSON.stringify(filterParams);

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4">
        {brand.logo?.url && (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-secondary">
            <Image
              src={brand.logo.url}
              alt={brand.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        )}
        <h1 className="font-display text-2xl text-foreground">{brand.name}</h1>
      </div>

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        {/* brands={[]} deliberately, not the full brand list — FilterPanel already hides its
            Brand chips section when the array is empty (see FilterPanel.tsx), and showing
            them here would be both redundant (this whole page IS one brand) and non-
            functional (this page pins `brand` from the ROUTE slug, not from a searchParam,
            so a chip click would update the URL while the page kept ignoring it). */}
        <ProductFilters brands={[]} />
        <div className="flex-1">
          <Suspense key={resultsKey} fallback={<ProductGridSkeleton />}>
            <ProductListingResults params={filterParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}