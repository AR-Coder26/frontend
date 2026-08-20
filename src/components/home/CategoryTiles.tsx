import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/types';

interface CategoryTilesProps {
  categories: Category[];
}

export function CategoryTiles({ categories }: CategoryTilesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="container py-12">
      <h2 className="font-display text-2xl text-foreground">Shop by Category</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/category/${category.slug}`}
            className="group relative flex aspect-square items-end overflow-hidden rounded-md bg-secondary"
          >
            {category.image ? (
              <Image
                src={category.image.url}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              // No image uploaded for this category yet — a plain tinted tile with just the
              // name, rather than a broken image icon or a fake stock photo.
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
            )}
            <span className="relative z-10 w-full bg-gradient-to-t from-foreground/70 to-transparent p-4 font-display text-lg text-background">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}