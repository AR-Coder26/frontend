// frontend/src/app/(shop)/category/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCategoryBySlug } from '@/lib/api/categories';
import { getBrands } from '@/lib/api/brands';
import { ApiError } from '@/lib/api/client';
import { ProductFilters } from '@/components/filters/ProductFilters';
import { ProductListingResults } from '@/components/product/ProductListingResults';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
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

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategoryOr404(slug);
  return { title: category.name, description: category.description ?? undefined };
}


export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const [category, brands] = await Promise.all([fetchCategoryOr404(slug), getBrands()]);

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
      <h1 className="font-display text-2xl text-foreground">{category.name}</h1>
      {category.description && (
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{category.description}</p>
      )}

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <ProductFilters brands={brands} />
        <div className="flex-1">
          <Suspense key={resultsKey} fallback={<ProductGridSkeleton />}>
            <ProductListingResults params={filterParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}