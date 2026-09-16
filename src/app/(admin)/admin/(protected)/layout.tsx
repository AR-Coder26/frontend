'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import { RequireAdminAuth } from '@/components/auth/RequireAdminAuth';
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

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAdminAuthStore((state) => state.admin);
  const clearAdmin = useAdminAuthStore((state) => state.clearAdmin);
  const unseenOrderCount = useAdminOrderNotifications(Boolean(admin));

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
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-neutral-900 text-neutral-200 flex flex-col border-r border-neutral-800 shrink-0">
        <div className="p-6 border-b border-neutral-800">
          <Link href="/admin/dashboard" className="text-xl font-bold tracking-tight text-white">
            Brandox Admin
          </Link>
          <p className="text-xs text-neutral-400 mt-1">E-Commerce Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
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
          <Link href="/" className="block text-neutral-300 hover:underline mt-1">
            &larr; View Live Shop
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-neutral-200 px-8 flex items-center justify-between">
          <h1 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Control Panel
          </h1>
          <div className="flex items-center gap-4">
            {admin && (
              <span className="text-xs font-medium text-neutral-500">
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
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
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
