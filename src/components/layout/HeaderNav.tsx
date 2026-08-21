'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import type { Category } from '@/types';
import { AccountMenu } from './AccountMenu';
import { Heart, Menu, ShoppingBag } from 'lucide-react';

interface HeaderNavProps {
  categories: Category[];
}

export function HeaderNav({ categories }: HeaderNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasMounted = useHasMounted();
  const cartCount = useCartStore((state) => state.getTotalItems());
  const openCartDrawer = useCartStore((state) => state.openDrawer);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const navLinks = [
    ...categories.map((category) => ({ label: category.name, href: `/category/${category.slug}` })),
    { label: '30% Off', href: '/sale' },
  ];

  return (
    <div className="border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* TODO(client): swap for the real store wordmark/logo once confirmed. */}
        <Link href="public\Assets\logo\Brand-logo.svg" className="font-display text-xl font-semibold tracking-tight text-foreground">
          Atelier
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative py-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
              {/* Signature interaction: a thread of gold draws in under the label on
                  hover — a nod to the zari/gota trim on the fabrics this store actually
                  sells, not a generic underline. */}
              <span className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <AccountMenu />

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/wishlist" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {hasMounted && wishlistCount > 0 && (
                <Badge
                  variant="accent"
                  className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full p-0 text-[10px] leading-4"
                >
                  {wishlistCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={openCartDrawer}
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {hasMounted && cartCount > 0 && (
              <Badge
                variant="accent"
                className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full p-0 text-[10px] leading-4"
              >
                {cartCount}
              </Badge>
            )}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Shop by category</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/track-order"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-md border-t border-border px-3 py-2.5 pt-4 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground"
                >
                  Track your order
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}