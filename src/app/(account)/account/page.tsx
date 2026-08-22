'use client';

import Link from 'next/link';
import { useCustomerAuthStore } from '@/store/customerAuthStore';

export default function AccountPage() {
  const customer = useCustomerAuthStore((state) => state.customer);

  return (
    <div>
      <h1 className="font-display text-2xl text-foreground">
        Welcome{customer ? `, ${customer.name}` : ''}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage your orders and delivery addresses.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="rounded-md border border-border p-5 transition-colors hover:border-primary"
        >
          <p className="font-display text-lg text-foreground">My Orders</p>
          <p className="mt-1 text-sm text-muted-foreground">View and track your orders.</p>
        </Link>
        <Link
          href="/account/addresses"
          className="rounded-md border border-border p-5 transition-colors hover:border-primary"
        >
          <p className="font-display text-lg text-foreground">My Addresses</p>
          <p className="mt-1 text-sm text-muted-foreground">Manage delivery addresses.</p>
        </Link>
      </div>
    </div>
  );
}