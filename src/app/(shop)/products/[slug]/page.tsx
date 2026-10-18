import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug } from '@/lib/api/products';
import { ApiError } from '@/lib/api/client';
import { ProductDetailInteractive } from '@/components/product/ProductDetailInteractive';
import { ProductSeoSections } from '@/components/product/ProductSeoSections';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { absoluteUrl, buildPageMetadata, SITE_NAME, truncate } from '@/lib/seo';
import { getCopyVars } from '@/lib/seoCopyVars';
import { formatPKR } from '@/lib/utils';
import type { Product } from '@/types';

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

function collectImageUrls(product: Product): string[] {
  const urls = [
    ...product.images.map((image) => image.url),
    ...product.variants.flatMap((variant) => variant.images.map((image) => image.url)),
  ];
  return Array.from(new Set(urls));
}

function stitchingLabel(product: Product): string {
  const options = new Set(product.variants.map((variant) => variant.fabricStatus));
  if (options.has('stitched') && options.has('unstitched')) return 'stitched & unstitched';
  if (options.has('stitched')) return 'stitched';
  return 'unstitched';
}

// Called by Next.js separately from the page component below, but both call the exact same
// getProductBySlug(slug) — Next's automatic fetch request memoization dedupes these into a
// single real network call per request.
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductOr404(slug);

  // Title formula: "{Name} – {Fabric} {n}-Piece | Brandox", falling back to "{Name} | Brandox"
  // when the long form would exceed ~60 characters.
  const longForm = `${product.name} – ${product.fabricType} ${product.pieceCount}-Piece`;
  const title = longForm.length <= 49 ? `${longForm} | ${SITE_NAME}` : `${product.name} | ${SITE_NAME}`;

  // Meta formula: "{Name}: {fabric} {n}-piece {stitching} suit. From Rs. X. COD, free Karachi delivery."
  const description = truncate(
    `${product.name}: ${product.fabricType.toLowerCase()} ${product.pieceCount}-piece ${stitchingLabel(product)} suit. ${
      product.minPrice === product.maxPrice ? '' : 'From '
    }${formatPKR(product.minPrice)}. Cash on Delivery, free delivery in Karachi.`,
    155
  );

  const image = collectImageUrls(product)[0] ?? null;

  return buildPageMetadata({
    title,
    description,
    path: `/products/${product.slug}`,
    image,
  });
}

function buildProductJsonLd(product: Product) {
  const url = absoluteUrl(`/products/${product.slug}`);
  const images = collectImageUrls(product).slice(0, 6);
  const inStock = !product.isOutOfStock;

  const offerBase = {
    '@type': 'Offer',
    url,
    priceCurrency: 'PKR',
    itemCondition: 'https://schema.org/NewCondition',
  } as const;

  // One Offer per variant (SKU/price/stock accurate); collapse to an AggregateOffer if a
  // product has an unusually large number of variants.
  const offers =
    product.variants.length > 0 && product.variants.length <= 20
      ? product.variants.map((variant) => ({
          ...offerBase,
          sku: variant.sku,
          name: `${variant.color} / ${variant.size} / ${variant.fabricStatus}`,
          price: variant.price,
          availability:
            variant.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        }))
      : {
          '@type': 'AggregateOffer',
          url,
          priceCurrency: 'PKR',
          lowPrice: product.minPrice,
          highPrice: product.maxPrice,
          offerCount: product.variants.length,
          availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: truncate(product.description, 5000),
    url,
    sku: product.variants[0]?.sku,
    image: images.length > 0 ? images : undefined,
    // The store's own name — deliberately NOT product.brand, which currently holds designer
    // names the store has no authorisation to use.
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: product.category.name,
    material: product.fabricType,
    offers,
    // aggregateRating / review are intentionally absent: add them only when real,
    // visible customer reviews exist on the page.
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductOr404(slug);
  const vars = await getCopyVars();

  return (
    <div className="container py-8">
      <JsonLd data={buildProductJsonLd(product)} />
      <Breadcrumbs
        items={[
          { name: product.category.name, href: `/category/${product.category.slug}` },
          { name: product.name, href: `/products/${product.slug}` },
        ]}
      />
      <ProductDetailInteractive product={product} />
      <ProductSeoSections product={product} vars={vars} />
    </div>
  );
}
