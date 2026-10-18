import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { BLOG_POSTS } from '@/content/blog';
import { estimateReadingMinutes } from '@/content/blog/types';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Brandox Journal | Fabric, Sizing & Suit Buying Guides',
  description:
    'Practical guides on lawn, cotton and khaddar, how to measure for a suit, and how to buy unstitched suits online in Pakistan.',
  path: '/blog',
});

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BlogIndexPage() {
  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ name: 'Journal', href: '/blog' }]} />
      <h1 className="font-display text-3xl text-foreground">Brandox Journal</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Fabric guides, sizing help and buying advice for women’s suits in Pakistan.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="flex flex-col rounded-lg border border-border bg-card p-5"
          >
            <p className="text-xs text-muted-foreground">
              {formatDate(post.publishedAt)} · {estimateReadingMinutes(post)} min read
            </p>
            <h2 className="mt-2 font-display text-xl text-foreground">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-4 text-sm text-primary hover:text-primary-hover"
            >
              Read the guide
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
