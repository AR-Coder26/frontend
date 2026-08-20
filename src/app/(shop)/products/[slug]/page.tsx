import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug } from '@/lib/api/products';
import { ApiError } from '@/lib/api/client';
import { ProductDetailInteractive } from '@/components/product/ProductDetailInteractive';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProductOr404(slug: string) {
  try {
    return await getProductBySlug(slug);
  } catch (error) {
    // A genuine "this product doesn't exist" should render Next's real 404 UI (see the new
    // (shop)/not-found.tsx, so it still gets the site's Header/Footer around it), not an
    // unhandled error screen. Anything else (network failure, 500, etc.) still throws
    // through normally.
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}

// Called by Next.js separately from the page component below, but both call the exact same
// getProductBySlug(slug) — Next's automatic fetch request memoization dedupes these into a
// single real network call per request, so this isn't double-fetching in practice. This is
// the framework's own recommended pattern for per-page metadata, not a premature
// optimization worry.
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductOr404(slug);
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductOr404(slug);

  return (
    <div className="container py-8">
      <ProductDetailInteractive product={product} />
    </div>
  );
}