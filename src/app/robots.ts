import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Served at /robots.txt. Private / transactional areas are blocked from crawling; filtered and
// sorted product URLs are handled with canonical + noindex in the page metadata instead
// (blocking them here would stop Google from ever seeing those tags).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/cart',
          '/checkout',
          '/wishlist',
          '/track-order',
          '/account',
          '/login',
          '/register',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
