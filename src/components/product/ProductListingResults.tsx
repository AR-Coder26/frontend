import { getProducts, type ProductListParams } from '@/lib/api/products';
import { ProductGrid } from './ProductGrid';
import { PaginationControls } from './PaginationControls';

interface ProductListingResultsProps {
  params: ProductListParams;
}

/**
 * Kept separate from the page files so /products and /sale can share the exact same
 * fetch-and-render logic — /sale is really just /products with `discount` pinned, not a
 * different feature.
 */
export async function ProductListingResults({ params }: ProductListingResultsProps) {
  const { products, total, page, totalPages } = await getProducts(params);

  return (
    <div>
      {/* Product cards use <h3>; this hidden <h2> stops the outline jumping from H1 to H3. */}
      <h2 className="sr-only">Products</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {total} {total === 1 ? 'product' : 'products'}
      </p>
      <ProductGrid products={products} />
      {totalPages > 1 && <PaginationControls page={page} totalPages={totalPages} />}
    </div>
  );
}
