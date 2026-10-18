/**
 * Article bodies are plain data. Inside any text string you can use:
 *   [label](/path)   -> internal link
 *   {PAYMENTS}       -> payment methods currently enabled in the admin
 *   {DELIVERY_RATE}  -> non-Karachi delivery fee from store settings
 */
export type ArticleBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

export const h2 = (text: string): ArticleBlock => ({ type: 'h2', text });
export const h3 = (text: string): ArticleBlock => ({ type: 'h3', text });
export const p = (text: string): ArticleBlock => ({ type: 'p', text });
export const ul = (items: string[]): ArticleBlock => ({ type: 'ul', items });
export const ol = (items: string[]): ArticleBlock => ({ type: 'ol', items });

export interface BlogPost {
  slug: string;
  /** On-page H1. */
  title: string;
  /** <title> (<= 60 chars, includes the brand). */
  seoTitle: string;
  /** Meta description (<= 155 chars). */
  description: string;
  primaryKeyword: string;
  /** ISO dates (YYYY-MM-DD). */
  publishedAt: string;
  updatedAt: string;
  /** Shown on the index card. */
  excerpt: string;
  /** "Keep reading" links under the article. */
  related: { label: string; href: string }[];
  blocks: ArticleBlock[];
}

/** Rough reading time (200 words/minute) from the article text. */
export function estimateReadingMinutes(post: BlogPost): number {
  const words = post.blocks
    .flatMap((block) => ('text' in block ? [block.text] : block.items))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
