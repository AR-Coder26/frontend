'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getMyOrderById, cancelMyOrder } from '@/lib/api/orders';
import { OrderDetailCard } from '@/components/orders/OrderDetailCard';
import { ApiError } from '@/lib/api/client';
import type { Order } from '@/types';


export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyOrderById(params.id)
      .then(setOrder)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Could not load order.')
      );
  }, [params.id]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!order) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <OrderDetailCard
      order={order}
      onCancel={(reason) => cancelMyOrder(order._id, reason)}
      onCancelled={setOrder}
    />
  );
}