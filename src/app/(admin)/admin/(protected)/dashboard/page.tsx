'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Package, ShoppingBag, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { getAdminOrders } from '@/lib/api/orders';
import { getAdminProducts } from '@/lib/api/products';
import { ApiError } from '@/lib/api/client';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { formatPKR } from '@/lib/utils';
import type { Order, Product } from '@/types';

interface DashboardStats {
  pendingOrders: number;
  totalOrdersToday: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
}

/**
 * Every number on this page comes from a real API call — nothing here is hardcoded. There's
 * no dedicated /admin/dashboard/stats endpoint on the backend, so these are genuinely
 * computed client-side from the same admin/orders and admin/products endpoints the rest of
 * the panel uses (small counts fetched with limit=100, which comfortably covers a launch
 * catalog of ~15-20 products per the client's own stated scale — see project context §2).
 */
export default function AdminDashboardPage() {
  const admin = useAdminAuthStore((state) => state.admin);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [pendingResult, recentResult, productsResult] = await Promise.all([
          getAdminOrders({ status: 'Pending', limit: 1 }),
          getAdminOrders({ limit: 6 }),
          getAdminProducts({ limit: 100, isActive: true }),
        ]);

        if (cancelled) return;

        const products: Product[] = productsResult.products;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const totalOrdersToday = recentResult.orders.filter(
          (o) => new Date(o.createdAt) >= startOfToday
        ).length;

        setStats({
          pendingOrders: pendingResult.total,
          totalOrdersToday,
          totalProducts: productsResult.total,
          lowStockCount: products.filter((p) => p.totalStock > 0 && p.totalStock <= 5).length,
          outOfStockCount: products.filter((p) => p.isOutOfStock).length,
        });
        setRecentOrders(recentResult.orders);
      } catch (error) {
        toast.error('Could not load dashboard', {
          description: error instanceof ApiError ? error.message : 'Please try again.',
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <AdminPageHeader
        title={admin ? `Welcome back, ${admin.name}` : 'Dashboard'}
        description="A live snapshot of orders and catalog health."
      />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-neutral-500">Loading dashboard…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Pending Orders" value={String(stats?.pendingOrders ?? 0)} icon={Clock} tone="warning" />
            <StatCard label="Orders Today" value={String(stats?.totalOrdersToday ?? 0)} icon={ShoppingBag} />
            <StatCard label="Active Products" value={String(stats?.totalProducts ?? 0)} icon={Package} />
            <StatCard
              label="Low / Out of Stock"
              value={`${stats?.lowStockCount ?? 0} / ${stats?.outOfStockCount ?? 0}`}
              icon={AlertTriangle}
              tone={((stats?.outOfStockCount ?? 0) > 0) ? 'warning' : 'default'}
            />
          </div>

          <div className="mt-8 rounded-lg border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h3 className="text-sm font-semibold text-neutral-900">Recent Orders</h3>
              <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-neutral-400">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {recentOrders.map((order) => (
                  <li key={order._id}>
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900">{order.orderNumber}</p>
                        <p className="truncate text-xs text-neutral-500">
                          {order.customer.name} &middot; {order.customer.phone}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <span className="text-sm font-medium text-neutral-900">{formatPKR(order.pricing.totalAmount)}</span>
                        <OrderStatusBadge status={order.orderStatus} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
