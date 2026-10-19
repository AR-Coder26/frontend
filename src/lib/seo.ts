import type { Metadata } from 'next';
import type { FabricType, StoreSettingsPublic } from '@/types';

/** Canonical public origin. Set NEXT_PUBLIC_SITE_URL in Vercel; www is the primary host. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.brandox.shop').replace(
  /\/+$/,
  ''
);
export const SITE_NAME = 'Brandox';
export const LOGO_URL = `${SITE_URL}/Assets/logo/Brand-logo.svg`;

/** Must match the discount the /sale page filters on. */
export const SALE_DISCOUNT_PERCENT = 30;

/** Fabric hub pages stay noindex until they hold at least this many products (thin-page guard). */
export const MIN_PRODUCTS_FOR_INDEXED_HUB = 4;

/** URL slug -> FabricType used by the backend filter. Only fabrics that have page copy. */
export const FABRIC_SLUGS: Record<string, FabricType> = {
  lawn: 'Lawn',
  khaddar: 'Khaddar',
  cotton: 'Cotton',
  chiffon: 'Chiffon',
  silk: 'Silk',
};

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

type SearchParams = { [key: string]: string | string[] | undefined };

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Any of these in the URL means "a filtered view", which must not compete with the clean page.
const FILTER_KEYS = ['fabricType', 'fabricStatus', 'size', 'brand', 'search'] as const;

/**
 * Decides canonical + noindex for listing pages (/products, /category/x, /fabric/x, /sale).
 *  - filter / search / sort=oldest  -> noindex,follow and canonical to the clean page
 *  - ?page=N (N>1)                  -> indexable, self-canonical
 *  - everything else                -> canonical to the clean path
 */
export function getListingSeoState(basePath: string, searchParams: SearchParams) {
  const hasFilter = FILTER_KEYS.some((key) => Boolean(firstValue(searchParams[key])));
  const sort = firstValue(searchParams.sort);
  const page = Math.max(1, Number(firstValue(searchParams.page)) || 1);
  const noindex = hasFilter || sort === 'oldest';
  const canonicalPath = !noindex && page > 1 ? `${basePath}?page=${page}` : basePath;
  return { canonicalPath, noindex, page, isCleanFirstPage: !noindex && page === 1 };
}

export function withPageSuffix(title: string, page: number): string {
  return page > 1 ? `${title} (Page ${page})` : title;
}

interface PageMetadataInput {
  /** Final <title>. Already includes " | Brandox" where wanted (the root template is bypassed). */
  title: string;
  description: string;
  /** Path (or absolute URL) used for the canonical and og:url. */
  path: string;
  noindex?: boolean;
  image?: string | null;
}

export function buildPageMetadata({
  title,
  description,
  path,
  noindex = false,
  image,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_PK',
      title,
      description,
      url,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/** For pages that must never be indexed (cart, checkout, account, admin ...). */
export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};

/** "Cash on Delivery, JazzCash, EasyPaisa or bank transfer" — only methods the admin turned on. */
export function formatPaymentMethods(settings: StoreSettingsPublic): string {
  const methods = [
    'Cash on Delivery',
    settings.jazzCash ? 'JazzCash' : null,
    settings.easyPaisa ? 'EasyPaisa' : null,
    settings.bankTransfer ? 'bank transfer' : null,
  ].filter((label): label is string => Boolean(label));
  const last = methods[methods.length - 1];
  if (methods.length === 1 || last === undefined) return methods[0] ?? 'Cash on Delivery';
  return `${methods.slice(0, -1).join(', ')} or ${last}`;
}

/** Replaces {TOKENS} in copy strings, leaving unknown tokens untouched. */
export function fillCopy(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

/** Removes the [label](/path) link syntax used in copy strings (for JSON-LD plain text). */
export function stripCopyLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, '$1');
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: stripCopyLinks(item.answer) },
    })),
  };
}
