'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { getAdminOrders, markOrderSeen } from '@/lib/api/orders';
import { ApiError } from '@/lib/api/client';
import { formatPKR } from '@/lib/utils';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/lib/constants';
import type { Order, OrderStatus } from '@/types';

const PAGE_LIMIT = 20;

/** useSearchParams() requires a Suspense boundary around whatever calls it — same convention
 *  already used for (shop)/products, /sale, /category/[slug], /brand/[slug]. The actual page
 *  content lives in OrdersListContent below; this default export just supplies the boundary. */
export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-neutral-500">Loading orders…</div>}>
      <OrdersListContent />
    </Suspense>
  );
}

function OrdersListContent() {
  // Reads ?search= on first render so links like the Customers page's "View Orders"
  // (/admin/orders?search=<phone>) actually land on a pre-filtered list, not a blank one.
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getAdminOrders({
      page,
      limit: PAGE_LIMIT,
      search: search || undefined,
      status: statusFilter || undefined,
    })
      .then((result) => {
        if (cancelled) return;
        setOrders(result.orders);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error('Could not load orders', {
          description: error instanceof ApiError ? error.message : 'Please try again.',
        });
      })
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
    };
  }, [page, search, statusFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function handleMarkSeen(order: Order, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const updated = await markOrderSeen(order._id);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    } catch (error) {
      toast.error('Could not mark as seen', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <div>
      <AdminPageHeader title="Orders" description={`${total} order${total === 1 ? '' : 's'} total.`} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex min-w-[220px] flex-1 items-center gap-2">
          <Input
            placeholder="Search order #, name, or phone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9"
          />
          <Button type="submit" size="sm" variant="outline" className="shrink-0">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </form>

        <Select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as OrderStatus | '');
          }}
          className="h-9 w-auto min-w-[150px]"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-neutral-500">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
          No orders match these filters.
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id} className={!order.isSeenByAdmin ? 'bg-amber-50/60' : undefined}>
                  <TableCell>
                    <Link href={`/admin/orders/${order._id}`} className="font-medium text-neutral-900 hover:underline">
                      {!order.isSeenByAdmin && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-500" aria-label="Unseen" />}
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="text-neutral-900">{order.customer.name}</p>
                    <p className="text-xs text-neutral-500">{order.customer.phone}</p>
                  </TableCell>
                  <TableCell className="text-neutral-500">{format(new Date(order.createdAt), 'd MMM yyyy, h:mm a')}</TableCell>
                  <TableCell className="text-neutral-500">{order.paymentMethod}</TableCell>
                  <TableCell className="font-medium text-neutral-900">{formatPKR(order.pricing.totalAmount)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.orderStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!order.isSeenByAdmin && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkSeen(order, e)}
                          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                          aria-label="Mark as seen"
                          title="Mark as seen"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                      >
                        View
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
