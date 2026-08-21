'use client';

import { useState } from 'react';
import { OrderLookupForm } from '@/components/orders/OrderLookupForm';
import { OrderDetailCard } from '@/components/orders/OrderDetailCard';
import { lookupGuestOrder, cancelGuestOrder } from '@/lib/api/orders';
import { ApiError } from '@/lib/api/client';
import type { Order } from '@/types';
import type { OrderLookupFormValues } from '@/lib/validators/orderLookup';

export default function TrackOrderPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Kept so the cancel action can re-send the same orderNumber+phone pair the lookup used —
  // cancelGuestOrder needs both to prove ownership, same as the lookup itself did.
  const [lastLookup, setLastLookup] = useState<OrderLookupFormValues | null>(null);

  async function handleLookup(values: OrderLookupFormValues) {
    setIsSubmitting(true);
    setLookupError(null);
    try {
      const result = await lookupGuestOrder(values.orderNumber, values.phone);
      setOrder(result);
      setLastLookup(values);
    } catch (error) {
      setOrder(null);
      setLookupError(
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-sm text-center">
        <h1 className="font-display text-2xl text-foreground">Track Your Order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your order number and the phone number used to place it.
        </p>
      </div>

      <div className="mt-8">
        <OrderLookupForm onSubmit={handleLookup} isSubmitting={isSubmitting} />
      </div>

      {lookupError && <p className="mt-4 text-center text-sm text-destructive">{lookupError}</p>}

      {order && lastLookup && (
        <div className="mx-auto mt-8 max-w-lg">
          <OrderDetailCard
            order={order}
            onCancel={(reason) => cancelGuestOrder(lastLookup.orderNumber, lastLookup.phone, reason)}
            onCancelled={setOrder}
          />
        </div>
      )}
    </div>
  );
}