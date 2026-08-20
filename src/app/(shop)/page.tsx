import Link from 'next/link';
import { getCategories } from '@/lib/api/categories';
import { getProducts } from '@/lib/api/products';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { RevealOnScroll } from '@/components/home/RevealOnScroll';
import { ProductGrid } from '@/components/product/ProductGrid';

// This file maps to "/" — (shop) is a route GROUP, its parentheses are stripped from the
// URL, so this sits at the site root while still picking up (shop)/layout.tsx's
// StorefrontShell automatically.
export default async function HomePage() {
  const [categories, newArrivals] = await Promise.all([
    getCategories(),
    getProducts({ sort: 'newest', limit: 8 }),
  ]);

  return (
    <div>
      <HeroSection />
      <CategoryTiles categories={categories} />

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
    </div>
  );
}