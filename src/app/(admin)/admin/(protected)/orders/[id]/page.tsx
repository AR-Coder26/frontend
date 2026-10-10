'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, MessageCircle, Mail, MapPin, Archive, ArchiveRestore } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ConfirmationProofUpload } from '@/components/admin/ConfirmationProofUpload';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { getAdminOrderById, updateOrderStatus, archiveOrder } from '@/lib/api/orders';
import { ApiError } from '@/lib/api/client';
import { formatPKR } from '@/lib/utils';
import { ORDER_STATUS_TRANSITIONS, ORDER_STATUS_LABELS } from '@/lib/constants';
import type { Order, OrderStatus } from '@/types';

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [nextStatus, setNextStatus] = useState<OrderStatus | ''>('');
  const [cancelReason, setCancelReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [adminNotes, setAdminNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        // This call also auto-marks isSeenByAdmin = true server-side — see the doc comment
        // on getAdminOrderById in lib/api/orders.ts. No separate mark-seen call needed here.
        const fetched = await getAdminOrderById(orderId);
        if (cancelled) return;
        setOrder(fetched);
        setAdminNotes(fetched.adminNotes ?? '');
      } catch (error) {
        if (cancelled) return;
        setLoadError(error instanceof ApiError ? error.message : 'Could not load this order.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function handleUpdateStatus() {
    if (!order || !nextStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateOrderStatus(order._id, {
        orderStatus: nextStatus,
        ...(nextStatus === 'Cancelled' && cancelReason ? { cancelReason } : {}),
      });
      setOrder(updated);
      setNextStatus('');
      setCancelReason('');
      toast.success(`Order marked as ${ORDER_STATUS_LABELS[nextStatus]}`);
    } catch (error) {
      // A 409 here (wrong transition, or Confirmed attempted before the OCR gate passes) is
      // the server's own hard business rule firing — surfaced verbatim, not reworded, since
      // backend PROJECT_STATE §7.8 is explicit that this cannot be bypassed by anyone.
      toast.error('Could not update status', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleArchive(archived: boolean) {
    if (!order) return;
    setIsArchiving(true);
    try {
      const updated = await archiveOrder(order._id, archived);
      setOrder(updated);
      toast.success(archived ? 'Order archived. It will be deleted automatically in 30 days.' : 'Order restored');
    } catch (error) {
      toast.error(archived ? 'Could not archive order' : 'Could not restore order', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleSaveNotes() {
    if (!order) return;
    setIsSavingNotes(true);
    try {
      const updated = await updateOrderStatus(order._id, { adminNotes });
      setOrder(updated);
      toast.success('Notes saved');
    } catch (error) {
      toast.error('Could not save notes', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setIsSavingNotes(false);
    }
  }

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading order…</div>;
  }

  if (loadError || !order) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        <p>{loadError ?? 'Order not found.'}</p>
        <Link href="/admin/orders" className="mt-3 inline-block text-sm font-medium text-foreground hover:underline">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[order.orderStatus];
  const confirmBlockedByGate = nextStatus === 'Confirmed' && !order.firstMessageSent;
  
  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
      </Link>

      <AdminPageHeader
        title={order.orderNumber}
        description={`Placed ${format(new Date(order.createdAt), 'd MMM yyyy, h:mm a')}${order.customerAccount ? '' : ' · Guest checkout'}`}
        action={<OrderStatusBadge status={order.orderStatus} />}
      />

      {order.orderStatus === 'Cancelled' && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
          {order.isArchived ? (
            <>
              <p className="min-w-0 text-sm text-foreground/80">
                <span className="font-semibold">Archived.</span>{' '}
                {order.deleteAt
                  ? `This order will be deleted automatically on ${format(new Date(order.deleteAt), 'd MMM yyyy')}.`
                  : 'Scheduled for automatic deletion.'}
              </p>
              <Button variant="outline" size="sm" disabled={isArchiving} onClick={() => handleArchive(false)} className="flex items-center gap-1.5">
                <ArchiveRestore className="h-3.5 w-3.5" /> {isArchiving ? 'Restoring…' : 'Restore'}
              </Button>
            </>
          ) : (
            <>
              <p className="min-w-0 text-sm text-muted-foreground">
                Cancelled orders can be archived to hide them from the main list. Archived orders are deleted automatically one month later.
              </p>
              <Button variant="outline" size="sm" disabled={isArchiving} onClick={() => handleArchive(true)} className="flex items-center gap-1.5">
                <Archive className="h-3.5 w-3.5" /> {isArchiving ? 'Archiving…' : 'Archive order'}
              </Button>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Items</h3>
            <Table stackOnMobile>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, i) => (
                  <TableRow key={`${item.variantSku}-${i}`}>
                    <TableCell label="Product" className="font-medium text-foreground">{item.productName}</TableCell>
                    <TableCell label="Variant" className="text-muted-foreground">
                      {item.color} / {item.size} / {item.fabricStatus}
                    </TableCell>
                    <TableCell label="Qty" className="text-muted-foreground">{item.quantity}</TableCell>
                    <TableCell label="Unit Price" className="text-right text-muted-foreground">{formatPKR(item.unitPrice)}</TableCell>
                    <TableCell label="Subtotal" className="text-right font-medium text-foreground">{formatPKR(item.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPKR(order.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery{order.isFreeDelivery && ' (Free — Karachi)'}</span>
                <span>{order.isFreeDelivery ? 'Rs. 0' : formatPKR(order.pricing.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 font-semibold text-foreground">
                <span>Total</span>
                <span>{formatPKR(order.pricing.totalAmount)}</span>
              </div>
            </div>
          </section>

          <ConfirmationProofUpload order={order} onVerified={setOrder} />

          {order.orderStatus === 'Cancelled' && (
            <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
              <h3 className="mb-1 text-sm font-semibold text-destructive">Cancelled</h3>
              <p className="break-words text-sm text-foreground/80">{order.cancelReason}</p>
              {order.cancelledAt && (
                <p className="mt-1 text-xs text-muted-foreground">{format(new Date(order.cancelledAt), 'd MMM yyyy, h:mm a')}</p>
              )}
            </section>
          )}

          <section className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Admin Notes</h3>
            <Textarea
              rows={4}
              maxLength={1000}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes about this order (not visible to the customer)…"
            />
            <Button
              type="button"
              size="sm"
              className="mt-2"
              disabled={isSavingNotes || adminNotes === (order.adminNotes ?? '')}
              onClick={handleSaveNotes}
            >
              {isSavingNotes ? 'Saving…' : 'Save Notes'}
            </Button>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Update Status</h3>
            {allowedNextStatuses.length === 0 ? (
              <p className="text-xs text-muted-foreground">This order is in a final state and cannot be changed further.</p>
            ) : (
              <div className="space-y-3">
                <Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value as OrderStatus | '')}>
                  <option value="">Select new status…</option>
                  {allowedNextStatuses.map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                  ))}
                </Select>

                {nextStatus === 'Cancelled' && (
                  <Input
                    placeholder="Cancellation reason (optional)"
                    maxLength={500}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                )}

                {confirmBlockedByGate && (
                  <p className="text-xs text-warning">
                    Upload a verified WhatsApp screenshot below before this order can be confirmed.
                  </p>
                )}

                <Button
                  type="button"
                  className="w-full"
                  disabled={!nextStatus || isUpdatingStatus || confirmBlockedByGate}
                  onClick={handleUpdateStatus}
                >
                  {isUpdatingStatus ? 'Updating…' : 'Update Status'}
                </Button>
                {nextStatus === 'Cancelled' && (
                  <p className="text-[11px] text-muted-foreground">Cancelling automatically restores stock for every item in this order.</p>
                )}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Customer</h3>
            <p className="text-sm font-medium text-foreground">{order.customer.name}</p>
            <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
            {order.customer.email && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {order.customer.email}
              </p>
            )}
            <a
              href={order.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-success hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Message on WhatsApp
            </a>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <MapPin className="h-3.5 w-3.5" /> Shipping Address
            </h3>
            <p className="text-sm text-foreground/80">{order.shippingAddress.addressLine}</p>
            <p className="text-sm text-foreground/80">
              {order.shippingAddress.city}
              {order.shippingAddress.postalCode && `, ${order.shippingAddress.postalCode}`}
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Payment</h3>
            <p className="text-sm text-foreground/80">{order.paymentMethod}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
