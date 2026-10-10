'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ShoppingBag, PackageCheck, XCircle, Banknote, TrendingUp, Truck } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { OwnerOnly } from '@/components/auth/OwnerOnly';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { getMonthlyReport } from '@/lib/api/analytics';
import { ApiError } from '@/lib/api/client';
import { formatPKR } from '@/lib/utils';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/lib/constants';
import type { MonthlyReport } from '@/types';

/** Current month as YYYY-MM in Pakistan time (matches the server's month boundaries). */
function currentMonthKey(): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
  const y = parts.find((p) => p.type === 'year')?.value ?? '';
  const m = parts.find((p) => p.type === 'month')?.value ?? '';
  return `${y}-${m}`;
}

function AnalyticsPage() {
  const [month, setMonth] = useState(currentMonthKey);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return;
    let cancelled = false;
    setIsLoading(true);
    getMonthlyReport(month)
      .then((r) => !cancelled && setReport(r))
      .catch((error) => {
        if (!cancelled) toast.error('Could not load the report', { description: error instanceof ApiError ? error.message : 'Please try again.' });
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [month]);

  const d = report?.delivered;

  return (
    <div>
      <AdminPageHeader
        title="Month-end report"
        description="Orders placed in the month (Pakistan time), by their current status. Only delivered orders count as sales."
        action={
          <div className="w-44">
            <label htmlFor="report-month" className="sr-only">Month</label>
            <Input id="report-month" type="month" value={month} max={currentMonthKey()} onChange={(e) => e.target.value && setMonth(e.target.value)} />
          </div>
        }
      />

      {isLoading || !report || !d ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-6">
          {!d.profitComplete && d.orders > 0 && (
            <div role="status" className="rounded-lg border border-warning/50 bg-warning/10 p-4 text-sm text-foreground">
              <p className="font-semibold">Profit is not shown for this month.</p>
              <p className="mt-1">
                {d.itemsMissingCost} delivered {d.itemsMissingCost === 1 ? 'item has' : 'items have'} no recorded cost, so a total profit would be a guess.
                Enter a cost on each product variant (Products &rarr; Edit). Orders placed before a cost was entered stay without one.
              </p>
              {d.partial && (
                <p className="mt-2 text-xs">
                  Partial figure for the {d.partial.items} delivered items that do have a cost: revenue {formatPKR(d.partial.revenue)} &minus; cost {formatPKR(d.partial.cost)} = {formatPKR(d.partial.profit)} (not the month&rsquo;s total).
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Orders placed" value={String(report.ordersPlaced)} icon={ShoppingBag} />
            <StatCard label="Delivered orders" value={String(d.orders)} icon={PackageCheck} tone="success" />
            <StatCard label="Items sold (delivered)" value={String(d.items)} icon={PackageCheck} />
            <StatCard label="Product revenue" value={formatPKR(d.productRevenue)} icon={Banknote} tone="success" />
            <StatCard label="Product cost" value={d.productCost === null ? 'Incomplete' : formatPKR(d.productCost)} icon={Banknote} tone={d.productCost === null ? 'warning' : 'default'} />
            <StatCard label="Gross profit" value={d.grossProfit === null ? 'Not available' : formatPKR(d.grossProfit)} icon={TrendingUp} tone={d.grossProfit === null ? 'warning' : 'success'} />
            <StatCard label="Delivery charges collected" value={formatPKR(d.deliveryCharges)} icon={Truck} />
            <StatCard label="Cancelled orders" value={String(report.cancelled.orders)} icon={XCircle} />
            <StatCard label="In progress" value={`${report.inProgress.orders} orders`} icon={ShoppingBag} tone="warning" />
          </div>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-foreground">By status</h3>
            <Table stackOnMobile>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Order value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORDER_STATUSES.map((status) => {
                  const row = report.byStatus[status];
                  return (
                    <TableRow key={status}>
                      <TableCell label="Status" className="font-medium text-foreground">{ORDER_STATUS_LABELS[status]}</TableCell>
                      <TableCell label="Orders">{row.orders}</TableCell>
                      <TableCell label="Items">{row.items}</TableCell>
                      <TableCell label="Order value">{formatPKR(row.value)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="mt-2 text-xs text-muted-foreground">
              Cancelled and in-progress values are shown for information only and are never included in revenue or profit.
              {report.cancelled.archived > 0 && ` ${report.cancelled.archived} cancelled ${report.cancelled.archived === 1 ? 'order is' : 'orders are'} archived and will be deleted automatically one month after archiving, after which they no longer appear here.`}
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <OwnerOnly>
      <AnalyticsPage />
    </OwnerOnly>
  );
}
