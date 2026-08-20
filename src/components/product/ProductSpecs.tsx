import type { Product } from '@/types';

interface ProductSpecsProps {
  product: Product;
}

const PIECE_COUNT_LABEL: Record<number, string> = {
  1: '1-Piece',
  2: '2-Piece',
  3: '3-Piece',
};

/** fabricType and pieceCount are PRODUCT-level fields set by the admin at upload time (see
 *  the Backend Contract Manifest) — they're specs to display, not customer-selectable
 *  options, unlike color/size/stitching which come from the variant array. */
export function ProductSpecs({ product }: ProductSpecsProps) {
  const specs = [
    { label: 'Fabric', value: product.fabricType },
    {
      label: 'Pieces',
      value: PIECE_COUNT_LABEL[product.pieceCount] ?? `${product.pieceCount}-Piece`,
    },
    { label: 'Category', value: product.category.name },
    { label: 'Brand', value: product.brand.name },
  ];

  return (
    <dl className="mt-6 divide-y divide-border border-t border-border text-sm">
      {specs.map((spec) => (
        <div key={spec.label} className="flex justify-between py-2.5">
          <dt className="text-muted-foreground">{spec.label}</dt>
          <dd className="text-foreground">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}