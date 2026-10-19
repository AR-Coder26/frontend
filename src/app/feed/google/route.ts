// frontend/src/app/feed/google/route.ts
//
// Google Merchant Center product feed (RSS 2.0 + g: namespace), served at /feed/google.
// In Merchant Center: Products -> Feeds -> add a "Scheduled fetch" pointing at
//   https://www.brandox.shop/feed/google
// Shipping (free in Karachi, a flat fee elsewhere) and returns are NOT in this file — set
// them in Merchant Center settings, where Karachi can be targeted by postal code.
import { getProducts } from '@/lib/api/products';
import { absoluteUrl, SITE_NAME, SITE_URL, truncate } from '@/lib/seo';
import type { Product } from '@/types';

export const revalidate = 3600;

const PAGE_SIZE = 50;

// Safety net: a product whose text mentions any of these is left OUT of the feed. Selling
// under another brand's name without authorisation can get a Merchant Center account
// suspended. Rename the product in the admin panel and it will appear automatically.
const BLOCKED_TERMS = [
  'maria.b',
  'maria b',
  'maria-b',
  'mariab',
  'zara shahjahan',
  'asim jofa',
  'sapphire',
  'khaadi',
  'alkaram',
  'charizma',
  'gul ahmed',
  'sana safinaz',
  'lulusar',
  'zarif',
  'maharani',
  'kashaf',
];

function mentionsBlockedBrand(product: Product): boolean {
  const haystack = `${product.name} ${product.slug} ${product.description} ${
    product.brand?.name ?? ''
  }`.toLowerCase();
  return BLOCKED_TERMS.some((term) => haystack.includes(term));
}

function xml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const money = (amount: number) => `${amount.toFixed(2)} PKR`;

async function getAllProducts(): Promise<Product[]> {
  const all: Product[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await getProducts({ page, limit: PAGE_SIZE, sort: 'newest' });
    all.push(...result.products);
    totalPages = result.totalPages;
    page += 1;
  } while (page <= totalPages && page <= 40);
  return all;
}

function buildItem(product: Product): string {
  const images = Array.from(
    new Set([
      ...product.images.map((image) => image.url),
      ...product.variants.flatMap((variant) => variant.images.map((image) => image.url)),
    ])
  );
  if (images.length === 0 || product.variants.length === 0) return '';

  const mainImage = images[0];
  if (!mainImage) return '';

  // The cheapest variant sets the listed price; if it has a higher "compare at" price,
  // that becomes the regular price and the variant price becomes the sale price.
  const cheapest = product.variants.reduce((best, variant) =>
    variant.price < best.price ? variant : best
  );
  const onSale = cheapest.comparePrice !== null && cheapest.comparePrice > cheapest.price;

  const title = `${product.name} – ${product.fabricType} ${product.pieceCount}-Piece Suit`;
  const description =
    truncate(product.description, 4900) ||
    `${product.fabricType} ${product.pieceCount}-piece suit for women.`;

  const lines = [
    `<g:id>${xml(product._id)}</g:id>`,
    `<title>${xml(truncate(title, 150))}</title>`,
    `<description>${xml(description)}</description>`,
    `<link>${xml(absoluteUrl(`/products/${product.slug}`))}</link>`,
    `<g:image_link>${xml(mainImage)}</g:image_link>`,
    ...images.slice(1, 11).map((url) => `<g:additional_image_link>${xml(url)}</g:additional_image_link>`),
    `<g:availability>${product.isOutOfStock ? 'out_of_stock' : 'in_stock'}</g:availability>`,
    `<g:price>${money(onSale ? (cheapest.comparePrice as number) : cheapest.price)}</g:price>`,
    ...(onSale ? [`<g:sale_price>${money(cheapest.price)}</g:sale_price>`] : []),
    `<g:condition>new</g:condition>`,
    `<g:brand>${xml(SITE_NAME)}</g:brand>`,
    `<g:identifier_exists>no</g:identifier_exists>`,
    `<g:google_product_category>${xml('Apparel & Accessories > Clothing > Outfit Sets')}</g:google_product_category>`,
    `<g:product_type>${xml(`Women > ${product.category.name} >${product.fabricType}`)}</g:product_type>`,
    `<g:gender>female</g:gender>`,
    `<g:age_group>adult</g:age_group>`,
    `<g:material>${xml(product.fabricType)}</g:material>`,
    ...(cheapest.color ? [`<g:color>${xml(cheapest.color)}</g:color>`] : []),
  ];

  return `    <item>\n      ${lines.join('\n      ')}\n    </item>`;
}

export async function GET() {
  let products: Product[] = [];
  try {
    products = await getAllProducts();
  } catch {
    products = [];
  }

  const items = products
    .filter((product) => product.isActive && !mentionsBlockedBrand(product))
    .map(buildItem)
    .filter(Boolean)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${xml(SITE_NAME)}</title>
    <link>${xml(SITE_URL)}</link>
    <description>${xml(`${SITE_NAME} product feed`)}</description>
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}