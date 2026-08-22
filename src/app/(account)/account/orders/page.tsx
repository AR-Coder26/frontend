'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyOrders } from '@/lib/api/orders';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatPKR } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import type { Order } from '@/types';

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyOrders()
      .then((result) => setOrders(result.orders))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Could not load orders.')
      );
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-foreground">My Orders</h1>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {!orders && !error && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
      {orders && orders.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          You haven&rsquo;t placed any orders yet.
        </p>
      )}

      {orders && orders.length > 0 && (
        <div className="mt-4 divide-y divide-border">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/account/orders/${order._id}`}
              className="flex items-center justify-between gap-4 py-4 hover:bg-secondary/50"
            >
              <div>
                <p className="text-sm font-medium text-foreground">#{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  · {formatPKR(order.pricing.totalAmount)}
                </p>
              </div>
              <OrderStatusBadge status={order.orderStatus} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}