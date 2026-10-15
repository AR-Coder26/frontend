import { Suspense } from 'react';
import Link from 'next/link';
import { getCategories } from '@/lib/api/categories';
import { getProducts } from '@/lib/api/products';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { RevealOnScroll } from '@/components/home/RevealOnScroll';
import { ProductGrid } from '@/components/product/ProductGrid';
import { CategoryTilesSkeleton, NewArrivalsSkeleton } from '@/components/skeletons/HomeSkeletons';

// Each data-driven section fetches for itself inside its own <Suspense>, so the hero (which
// needs no data) paints immediately and the two sections stream in independently, instead of
// the whole page waiting for the slowest of the two API calls before showing anything.
async function CategorySection() {
  const categories = await getCategories();
  return <CategoryTiles categories={categories} />;
}

async function NewArrivalsSection() {
  const newArrivals = await getProducts({ sort: 'newest', limit: 8 });

  return (
    <section className="container py-12">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-foreground">New Arrivals</h2>
        <Link
          href="/products?sort=newest"
          className="text-sm text-primary hover:text-primary-hover"
        >
          View all
        </Link>
      </div>
      <div className="mt-6">
        <RevealOnScroll>
          <ProductGrid products={newArrivals.products} />
        </RevealOnScroll>
      </div>
    </section>
  );
}

// This file maps to "/" — (shop) is a route GROUP, its parentheses are stripped from the
// URL, so this sits at the site root while still picking up (shop)/layout.tsx's
// StorefrontShell automatically.
export default function HomePage() {
  return (
    <div>
      <HeroSection />

      <Suspense fallback={<CategoryTilesSkeleton />}>
        <CategorySection />
      </Suspense>

      <Suspense fallback={<NewArrivalsSkeleton />}>
        <NewArrivalsSection />
      </Suspense>
    </div>
  );
}
