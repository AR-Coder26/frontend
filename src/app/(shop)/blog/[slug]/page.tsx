import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleBody } from '@/components/blog/ArticleBody';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { BLOG_POSTS, getBlogPost } from '@/content/blog';
import { estimateReadingMinutes } from '@/content/blog/types';
import { absoluteUrl, buildPageMetadata, LOGO_URL, SITE_NAME, SITE_URL } from '@/lib/seo';
import { getCopyVars } from '@/lib/seoCopyVars';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return buildPageMetadata({
    title: post.seoTitle,
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const vars = await getCopyVars();
  const url = absoluteUrl(`/blog/${post.slug}`);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    inLanguage: 'en-PK',
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
  };

  return (
    <div className="container py-8">
      <JsonLd data={articleJsonLd} />
      <Breadcrumbs
        items={[
          { name: 'Journal', href: '/blog' },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      <article className="mx-auto max-w-3xl">
        <header className="border-b border-border pb-6">
          <h1 className="font-display text-3xl leading-tight text-foreground">{post.title}</h1>
          <p className="mt-3 text-xs text-muted-foreground">
            By the {SITE_NAME} team · Published {formatDate(post.publishedAt)}
            {post.updatedAt !== post.publishedAt ? ` · Updated ${formatDate(post.updatedAt)}` : ''}
            {' · '}
            {estimateReadingMinutes(post)} min read
          </p>
        </header>

        <div className="mt-6">
          <ArticleBody blocks={post.blocks} vars={vars} />
        </div>

        <aside className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-xl text-foreground">Keep reading</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {post.related.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-primary hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </article>
    </div>
  );
}
