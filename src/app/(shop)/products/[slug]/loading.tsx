import { ProductDetailSkeleton } from '@/components/skeletons/ProductDetailSkeleton';

export default function ProductLoading() {
  return (
    <div className="container py-8">
      <ProductDetailSkeleton />
    </div>
  );
}
