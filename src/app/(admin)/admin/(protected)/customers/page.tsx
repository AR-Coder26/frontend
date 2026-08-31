'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Search, MessageCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { getAdminOrders } from '@/lib/api/orders';
import { ApiError } from '@/lib/api/client';
import { formatPKR } from '@/lib/utils';
import type { Order } from '@/types';

interface CustomerSummary {
  phone: string;
  name: string;
  whatsappNumber: string;
  email: string | null;
  hasAccount: boolean;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
}

const FETCH_PAGE_SIZE = 100;
const MAX_PAGES = 20; // hard cap (2,000 orders) so this never runs away on a large catalog

/**
 * IMPORTANT DESIGN NOTE (also shown in the UI below, not just here): the backend has no
 * dedicated admin "list customers" endpoint — there is no customerAdmin.routes.js, and the
 * Customer model only exposes itself/its own addresses via protectCustomer-gated routes (see
 * backend PROJECT_STATE §6). Guest checkouts don't even create a Customer document at all.
 *
 * Rather than invent a backend route that doesn't exist, or render fabricated rows (explicitly
 * against this task's "zero mock data" requirement), this page is built on the one thing that
 * IS real and already fully wired: GET /admin/orders. Every order carries a full
 * OrderCustomerInfo snapshot regardless of whether it was a guest or account checkout (see
 * backend PROJECT_STATE §5's Order model — customer.name/phone/whatsappNumber/email are always
 * captured, deliberately never live-referenced). Aggregating that by phone number gives a
 * genuine, live "who has actually ordered from us" view — arguably more useful for this
 * business than an account registry would be, since guest checkout is fully supported and a
 * meaningful share of real customers may never register an account at all.
 *
 * If a true customer-accounts admin view (browsing Customer documents directly, independent of
 * whether they've ordered) is wanted later, that requires a new backend endpoint — flagged here
 * rather than silently worked around.
 */
export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wasCapped, setWasCapped] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadAllOrders() {
      setIsLoading(true);
      try {
        const first = await getAdminOrders({ page: 1, limit: FETCH_PAGE_SIZE });
        if (cancelled) return;

        let allOrders = first.orders;
        const pagesToFetch = Math.min(first.totalPages, MAX_PAGES);
        if (first.totalPages > MAX_PAGES) setWasCapped(true);

        if (pagesToFetch > 1) {
          const rest = await Promise.all(
            Array.from({ length: pagesToFetch - 1 }, (_, i) => getAdminOrders({ page: i + 2, limit: FETCH_PAGE_SIZE }))
          );
          allOrders = [...allOrders, ...rest.flatMap((r) => r.orders)];
        }

        if (!cancelled) setOrders(allOrders);
      } catch (error) {
        if (!cancelled) {
          toast.error('Could not load customer data', {
            description: error instanceof ApiError ? error.message : 'Please try again.',
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAllOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const customers = useMemo<CustomerSummary[]>(() => {
    const byPhone = new Map<string, CustomerSummary>();

    for (const order of orders) {
      const existing = byPhone.get(order.customer.phone);
      const isMostRecent = !existing || new Date(order.createdAt) > new Date(existing.lastOrderAt);

      if (!existing) {
        byPhone.set(order.customer.phone, {
          phone: order.customer.phone,
          name: order.customer.name,
          whatsappNumber: order.customer.whatsappNumber,
          email: order.customer.email,
          hasAccount: order.customerAccount !== null,
          orderCount: 1,
          totalSpent: order.orderStatus === 'Cancelled' ? 0 : order.pricing.totalAmount,
          lastOrderAt: order.createdAt,
        });
      } else {
        existing.orderCount += 1;
        if (order.orderStatus !== 'Cancelled') existing.totalSpent += order.pricing.totalAmount;
        if (order.customerAccount !== null) existing.hasAccount = true;
        if (isMostRecent) {
          existing.name = order.customer.name;
          existing.whatsappNumber = order.customer.whatsappNumber;
          existing.email = order.customer.email ?? existing.email;
          existing.lastOrderAt = order.createdAt;
        }
      }
    }

    return Array.from(byPhone.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email ?? '').toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description={`${customers.length} unique customer${customers.length === 1 ? '' : 's'}, derived from ${orders.length} order${orders.length === 1 ? '' : 's'}.`}
      />

      <div className="mb-4 flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          This list is built from order history, not a separate customer directory — guest checkout is fully
          supported and many real customers may never create an account. Each row is aggregated by phone number.
          {wasCapped && ' (Showing the most recent 2,000 orders.)'}
        </p>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search name, phone, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-neutral-500">Loading customers…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
          {customers.length === 0 ? 'No orders have been placed yet.' : 'No customers match your search.'}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((customer) => (
              <TableRow key={customer.phone}>
                <TableCell className="font-medium text-neutral-900">{customer.name}</TableCell>
                <TableCell>
                  <p className="text-neutral-700">{customer.phone}</p>
                  {customer.email && <p className="text-xs text-neutral-400">{customer.email}</p>}
                </TableCell>
                <TableCell>
                  <Badge variant={customer.hasAccount ? 'success' : 'outline'}>
                    {customer.hasAccount ? 'Registered' : 'Guest'}
                  </Badge>
                </TableCell>
                <TableCell className="text-neutral-700">{customer.orderCount}</TableCell>
                <TableCell className="font-medium text-neutral-900">{formatPKR(customer.totalSpent)}</TableCell>
                <TableCell className="text-neutral-500">{format(new Date(customer.lastOrderAt), 'd MMM yyyy')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-3">
                    <a
                      href={`https://wa.me/${customer.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
                      aria-label="Message on WhatsApp"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                    <Link
                      href={`/admin/orders?search=${encodeURIComponent(customer.phone)}`}
                      className="text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:underline"
                    >
                      View Orders
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
