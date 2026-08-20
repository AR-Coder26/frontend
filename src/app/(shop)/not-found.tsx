import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Rendered by notFound() calls anywhere under (shop) — e.g. products/[slug]/page.tsx for a
// product that doesn't exist. Living inside (shop) means it's still wrapped by
// (shop)/layout.tsx's StorefrontShell, so Header/Footer/WhatsApp FAB stay visible instead of
// falling back to Next's bare, unstyled default 404.
export default function ShopNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-3xl text-foreground">404</p>
      <h1 className="mt-2 font-display text-xl text-foreground">
        We couldn&rsquo;t find that page
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The product or page you&rsquo;re looking for may have been removed, or the link may
        be incorrect.
      </p>
      <Button asChild className="mt-6">
        <Link href="/products">Continue shopping</Link>
      </Button>
    </div>
  );
}