'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogOut, Menu } from 'lucide-react';
import { RequireAdminAuth } from '@/components/auth/RequireAdminAuth';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { logoutAdmin } from '@/lib/api/auth';
import { useAdminOrderNotifications } from '@/hooks/useAdminOrderNotifications';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Brands', href: '/admin/brands' },
  { label: 'Orders', href: '/admin/orders', showOrderBadge: true },
  { label: 'Customers', href: '/admin/customers' },
  { label: 'Settings', href: '/admin/settings' },
  { label: 'Social Links', href: '/admin/social-links' },
] as const;

interface SidebarContentProps {
  pathname: string;
  unseenOrderCount: number;
  /** Called after any link inside the sidebar is clicked — the mobile drawer uses it to close itself. */
  onNavigate?: () => void;
}

/**
 * The sidebar's inner markup, shared by the permanent desktop <aside> (lg and up) and the
 * off-canvas mobile/tablet drawer (below lg) so the two can never drift apart.
 */
function SidebarContent({ pathname, unseenOrderCount, onNavigate }: SidebarContentProps) {
  return (
    <>
      <div className="p-6 border-b border-neutral-800">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="text-xl font-bold tracking-tight text-white"
        >
          Brandox Admin
        </Link>
        <p className="text-xs text-neutral-400 mt-1">E-Commerce Management</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
              }`}
            >
              {item.label}
              {'showOrderBadge' in item && item.showOrderBadge && unseenOrderCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-semibold text-destructive-foreground">
                  {unseenOrderCount > 99 ? '99+' : unseenOrderCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800 text-xs text-neutral-500 text-center">
        Back to Storefront:
        <Link href="/" onClick={onNavigate} className="block text-neutral-300 hover:underline mt-1">
          &larr; View Live Shop
        </Link>
      </div>
    </>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAdminAuthStore((state) => state.admin);
  const clearAdmin = useAdminAuthStore((state) => state.clearAdmin);
  const unseenOrderCount = useAdminOrderNotifications(Boolean(admin));
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // If the drawer is open and the viewport grows to desktop width (e.g. a tablet rotated to
  // landscape), the permanent sidebar takes over — close the drawer so no stray overlay is left.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) setIsMobileNavOpen(false);
    }
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  async function handleLogout() {
    try {
      await logoutAdmin();
    } finally {
      clearAdmin();
      toast.success('Logged out');
      router.push('/admin/login');
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-900">
      {/* Desktop Sidebar (lg and up) — hidden below lg, where the drawer below replaces it */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-800 bg-neutral-900 text-neutral-200 lg:flex">
        <SidebarContent pathname={pathname} unseenOrderCount={unseenOrderCount} />
      </aside>

      {/* Mobile / Tablet Drawer (below lg) — Radix Dialog under the hood: focus trap, ESC and
          overlay-click to close, and body scroll lock all come built in. */}
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent
          side="left"
          aria-describedby={undefined}
          className="flex w-72 max-w-[85vw] flex-col gap-0 border-neutral-800 bg-neutral-900 p-0 text-neutral-200 lg:hidden"
        >
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SidebarContent
            pathname={pathname}
            unseenOrderCount={unseenOrderCount}
            onNavigate={() => setIsMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 sm:h-16 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="relative -ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-100 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
              {unseenOrderCount > 0 && (
                <span
                  className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-white"
                  aria-hidden="true"
                />
              )}
            </button>
            <h1 className="truncate text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Control Panel
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {admin && (
              <span className="hidden text-xs font-medium text-neutral-500 md:inline">
                Logged in as <span className="text-neutral-900">{admin.name}</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 px-3 py-1.5 rounded-full transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log Out
            </button>
          </div>
        </header>

        {/* Page Dynamic Body */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdminAuth>
      <AdminShell>{children}</AdminShell>
    </RequireAdminAuth>
  );
}
