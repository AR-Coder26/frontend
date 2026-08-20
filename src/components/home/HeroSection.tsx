'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Deliberately text-only — no hero photography, because there is no real product/lifestyle
// photography to use yet and a stock/placeholder image would violate the zero-mock-data
// mandate just as much as fake product data would. TODO(client): once real photography
// exists, this can grow a right-side image slot without restructuring anything below.
export function HeroSection() {
  return (
    <section className="border-b border-border bg-secondary">
      <div className="container flex min-h-[60vh] flex-col items-start justify-center py-16 sm:min-h-[70vh]">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-xs font-medium uppercase tracking-[0.2em] text-accent"
        >
          Lawn · Cotton · Khaddar · Chiffon · Silk
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="mt-4 max-w-xl font-display text-4xl italic text-foreground sm:text-5xl"
        >
          Stitched for every wardrobe.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base"
        >
          Stitched and unstitched suits in 1, 2 and 3-piece — with Cash on Delivery and free
          delivery across Karachi.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="mt-8 flex gap-3"
        >
          <Button size="lg" asChild>
            <Link href="/products">Shop All</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/sale">30% Off</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}