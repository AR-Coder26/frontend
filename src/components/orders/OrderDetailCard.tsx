'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './OrderStatusBadg';
import { formatPKR } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import type { Order } from '@/types';

interface OrderDetailCardProps {
  order: Order;
  /** Auth-agnostic on purpose — the caller decides whether this resolves to
   *  cancelGuestOrder (track-order page) or cancelMyOrder (future account order page). This
   *  component only knows "cancel with an optional reason, get the updated order back." */
  onCancel: (cancelReason?: string) => Promise<Order>;
  onCancelled: (order: Order) => void;
}

export function OrderDetailCard({ order, onCancel, onCancelled }: OrderDetailCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  async function handleConfirmCancel() {
    setIsCancelling(true);
    try {
      const updated = await onCancel(cancelReason || undefined);
      onCancelled(updated);
      toast.success('Order cancelled');
      setShowCancelConfirm(false);
    } catch (error) {
      toast.error('Could not cancel order', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="rounded-md border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-lg text-foreground">#{order.orderNumber}</p>
          <p className="text-xs text-muted-foreground">
            Placed{' '}
            {new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <div className="mt-4 divide-y divide-border border-t border-border">
        {order.items.map((item) => (
          <div
            key={`${item.product}-${item.variantSku}`}
            className="flex justify-between py-2.5 text-sm"
          >
            <div>
              <p className="text-foreground">{item.productName}</p>
              <p className="text-xs text-muted-foreground">
                {item.color} · {item.size} · <span className="capitalize">{item.fabricStatus}</span>{' '}
                × {item.quantity}
              </p>
            </div>
            <span className="shrink-0 text-foreground">{formatPKR(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{formatPKR(order.pricing.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span className="text-foreground">
            {order.isFreeDelivery ? 'Free' : formatPKR(order.pricing.deliveryCharge)}
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-1.5 font-display text-base">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">{formatPKR(order.pricing.totalAmount)}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3 text-sm">
        <p className="text-muted-foreground">
          Delivering to {order.shippingAddress.addressLine}, {order.shippingAddress.city}
        </p>
        <p className="mt-1 text-muted-foreground">Payment: {order.paymentMethod}</p>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        No live courier tracking — further updates on this order are sent via WhatsApp.
      </p>

      {order.cancelReason && (
        <p className="mt-2 text-xs text-destructive">Cancelled: {order.cancelReason}</p>
      )}

      {/* Uses the backend's own `canBeCancelled` virtual directly rather than
          re-implementing the Delivered/Cancelled terminal-state rule client-side — one
          source of truth, no risk of the two drifting apart. */}
      {order.canBeCancelled && (
        <div className="mt-4 border-t border-border pt-4">
          {!showCancelConfirm ? (
            <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(true)}>
              Cancel Order
            </Button>
          ) : (
            <div className="space-y-2">
              <label htmlFor="cancelReason" className="text-xs font-medium text-muted-foreground">
                Reason (optional)
              </label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling…' : 'Confirm Cancellation'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowCancelConfirm(false)}>
                  Never mind
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}