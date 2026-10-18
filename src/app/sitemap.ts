import type { MetadataRoute } from 'next';
import { getCategories } from '@/lib/api/categories';
import { getProducts } from '@/lib/api/products';
import {
  absoluteUrl,
  FABRIC_SLUGS,
  MIN_PRODUCTS_FOR_INDEXED_HUB,
  SALE_DISCOUNT_PERCENT,
} from '@/lib/seo';
import { BLOG_POSTS } from '@/content/blog';
import type { Product } from '@/types';

// Rebuilt at most once an hour. Every section below is wrapped in try/catch so a temporary
// backend problem returns a smaller sitemap instead of a 500.
export const revalidate = 3600;

const PAGE_SIZE = 50; // the API caps `limit` at 50

async function getAllProducts(): Promise<Product[]> {
  const all: Product[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await getProducts({ page, limit: PAGE_SIZE, sort: 'newest' });
    all.push(...result.products);
    totalPages = result.totalPages;
    page += 1;
  } while (page <= totalPages && page <= 40); // hard stop: 2,000 products
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/products'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/karachi'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/size-guide'), changeFrequency: 'yearly', priority: 0.4 },
    { url: absoluteUrl('/faq'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/about'), changeFrequency: 'yearly', priority: 0.4 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly', priority: 0.4 },
    { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.6 },
    ...BLOG_POSTS.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    { url: absoluteUrl('/refund-policy'), changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/terms-of-service'), changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/privacy-policy'), changeFrequency: 'yearly', priority: 0.2 },
  ];

  // Sale page only when something is actually on sale.
  try {
    const { total } = await getProducts({ discount: SALE_DISCOUNT_PERCENT, limit: 1 });
    if (total > 0) {
      entries.push({
        url: absoluteUrl('/sale'),
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
  } catch {
    // skip
  }

  // Categories
  try {
    const categories = await getCategories();
    for (const category of categories) {
      entries.push({
        url: absoluteUrl(`/category/${category.slug}`),
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
  } catch {
    // skip
  }

  // Fabric hubs — only the ones that are not thin (same rule as the page's own noindex).
  for (const [slug, fabricType] of Object.entries(FABRIC_SLUGS)) {
    try {
      const { total } = await getProducts({ fabricType, limit: 1 });
      if (total >= MIN_PRODUCTS_FOR_INDEXED_HUB) {
        entries.push({
          url: absoluteUrl(`/fabric/${slug}`),
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    } catch {
      // skip
    }
  }

  // Products
  try {
    const products = await getAllProducts();
    for (const product of products) {
      entries.push({
        url: absoluteUrl(`/products/${product.slug}`),
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch {
    // skip
  }

  return entries;
}
