'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCustomerAuthStore } from '@/store/customerAuthStore';
import { logoutCustomer } from '@/lib/api/auth';
import { cn } from '@/lib/utils';
import { useHasMounted } from '@/hooks/useHasMounted';
import type { Category } from '@/types';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { AccountMenu } from './AccountMenu';
import { OverflowNav } from './OverflowNav';
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

  const pathname = usePathname();
  const authStatus = useCustomerAuthStore((state) => state.status);
  const customer = useCustomerAuthStore((state) => state.customer);
  const clearCustomer = useCustomerAuthStore((state) => state.clearCustomer);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const onWishlist = isActive('/wishlist');

  // Same sequence AccountMenu uses: clear local state even if the network call fails, because
  // leaving a stale "logged in" UI up is worse than clearing eagerly.
  async function handleDrawerLogout() {
    setMobileOpen(false);
    try {
      await logoutCustomer();
    } finally {
      clearCustomer();
      toast.success('Logged out');
    }
  }

  // One look for every row in the drawer. The inset bar + tinted background + font weight
  // (three cues, not just color) mark the current page; aria-current says it to screen readers.
  const drawerLinkClass = (active: boolean) =>
    cn(
      'flex min-h-11 items-center rounded-md px-3 py-2.5 text-sm hover:bg-secondary hover:text-foreground',
      active
        ? 'bg-secondary font-medium text-foreground shadow-[inset_2px_0_0_hsl(var(--primary))]'
        : 'text-foreground/80'
    );

  const categoryLinks = categories.map((category) => ({
    label: category.name,
    href: `/category/${category.slug}`,
  }));
  // "30% Off" is a promotion, not a category: on desktop it stays pinned in the bar and is
  // never moved into the "More" menu, however many categories exist.
  const pinnedLinks = [{ label: '30% Off', href: '/sale' }];
  const navLinks = [...categoryLinks, ...pinnedLinks];

  return (
    <div className="border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Real logo — file lives at public/Assets/logo/Brand-logo.svg. Height fixed at 32px,
            width auto so the SVG's natural aspect ratio is preserved regardless of how wide
            the actual wordmark/mark combination turns out to be. */}
        <Link href="/" className="flex shrink-0 items-center" aria-label="Brandox — home">
          <Image
            src="/Assets/logo/Brand-logo.svg"
            alt="Brandox"
            width={140}
            height={32}
            priority
            className="h-12 w-auto"
          />
        </Link>

        <OverflowNav links={categoryLinks} pinnedLinks={pinnedLinks} aria-label="Shop by category" />

        <div className="flex shrink-0 items-center gap-1">
          {/* Icon toggle from sm up; below sm the header is full, so the choice lives in the menu drawer. */}
          <ThemeToggle variant="icon" className="hidden sm:inline-flex" />

          <AccountMenu />

          <Button
            variant="ghost"
            size="icon"
            asChild
            className={cn('relative', onWishlist && 'text-primary')}
          >
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              aria-current={onWishlist ? 'page' : undefined}
            >
              <Heart className="h-5 w-5" fill={onWishlist ? 'currentColor' : 'none'} />
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
            {/* overflow-y-auto: with many categories + the account and theme sections this panel
                is taller than a phone held sideways, and without it the bottom rows are
                unreachable. aria-describedby={undefined} is Radix's documented way to say "no
                description" (this panel has a title only) and silences its dev-console warning. */}
            <SheetContent
              side="left"
              className="overflow-y-auto overscroll-contain"
              aria-describedby={undefined}
            >
              <SheetHeader>
                <SheetTitle>Shop by category</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={drawerLinkClass(isActive(link.href))}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 border-t border-border pt-2">
                  <Link
                    href="/track-order"
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive('/track-order') ? 'page' : undefined}
                    className={drawerLinkClass(isActive('/track-order'))}
                  >
                    Track your order
                  </Link>
                </div>
              </nav>

              {/* The header's account icon is hidden below the sm breakpoint, so on a phone this
                  drawer is the ONLY way to log in, register or reach the account pages. Nothing
                  is rendered while the session check is still running, to avoid flashing the
                  wrong state. */}
              {authStatus === 'authenticated' && customer && (
                <nav aria-label="Account" className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
                  <p className="mb-1 truncate px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {customer.name}
                  </p>
                  {[
                    { label: 'My account', href: '/account', exact: true },
                    { label: 'My orders', href: '/account/orders', exact: false },
                    { label: 'My addresses', href: '/account/addresses', exact: false },
                  ].map((link) => {
                    const active = link.exact ? pathname === link.href : isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={drawerLinkClass(active)}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleDrawerLogout}
                    className="flex min-h-11 items-center rounded-md px-3 py-2.5 text-left text-sm text-destructive hover:bg-secondary"
                  >
                    Log out
                  </button>
                </nav>
              )}
              {authStatus === 'unauthenticated' && (
                <nav aria-label="Account" className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive('/login') ? 'page' : undefined}
                    className={drawerLinkClass(isActive('/login'))}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive('/register') ? 'page' : undefined}
                    className={drawerLinkClass(isActive('/register'))}
                  >
                    Create account
                  </Link>
                </nav>
              )}
              <div className="mt-6 border-t border-border pt-4">
                <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Appearance
                </p>
                <ThemeToggle variant="segmented" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}