import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCategories } from '@/lib/api/categories';
import { getProducts } from '@/lib/api/products';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { RevealOnScroll } from '@/components/home/RevealOnScroll';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SeoCopy } from '@/components/seo/SeoCopy';
import { CategoryTilesSkeleton, NewArrivalsSkeleton } from '@/components/skeletons/HomeSkeletons';
import { buildPageMetadata } from '@/lib/seo';
import { FABRIC_SEO, HOME_SEO } from '@/lib/seoContent';
import { getCopyVars } from '@/lib/seoCopyVars';

export const metadata: Metadata = buildPageMetadata({
  title: HOME_SEO.title,
  description: HOME_SEO.description,
  path: '/',
});

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
        <Link href="/products" className="text-sm text-primary hover:text-primary-hover">
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

// Fabric shortcuts (internal links to the /fabric/* hubs) + the home body copy.
async function HomeSeoSection() {
  const vars = await getCopyVars();
  const fabrics = Object.entries(FABRIC_SEO).map(([slug, seo]) => ({
    slug,
    label: seo.h1.replace(' for Women', ''),
  }));

  return (
    <section className="container pb-12">
      <h2 className="font-display text-2xl text-foreground">Shop by Fabric</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {fabrics.map((fabric) => (
          <Link
            key={fabric.slug}
            href={`/fabric/${fabric.slug}`}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {fabric.label}
          </Link>
        ))}
        <Link
          href="/karachi"
          className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Free Delivery in Karachi
        </Link>
      </div>

      <SeoCopy blocks={HOME_SEO.blocks} vars={vars} />
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

      <Suspense fallback={null}>
        <HomeSeoSection />
      </Suspense>
    </div>
  );
}
