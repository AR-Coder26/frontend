'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerAuthStore } from '@/store/customerAuthStore';
import { logoutCustomer } from '@/lib/api/auth';

/**
 * No /account page exists yet (next phase) — a logged-in customer's icon click logs out
 * directly rather than linking somewhere that 404s. Honest and functional now, easy to
 * upgrade to a real dropdown (My Orders, My Addresses, Logout) once account pages land.
 */
export function AccountMenu() {
  const status = useCustomerAuthStore((state) => state.status);
  const customer = useCustomerAuthStore((state) => state.customer);
  const clearCustomer = useCustomerAuthStore((state) => state.clearCustomer);

  async function handleLogout() {
    try {
      await logoutCustomer();
    } finally {
      // Clear local state regardless of whether the network call itself succeeded —
      // leaving stale "logged in" UI up after a network hiccup is worse than clearing
      // eagerly; the cookie is what actually matters and logoutCustomer() already asked the
      // server to drop it.
      clearCustomer();
      toast.success('Logged out');
    }
  }

  if (status === 'authenticated' && customer) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        aria-label={`Log out (${customer.name})`}
        title={`Log out ${customer.name}`}
        className="hidden sm:inline-flex"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
      <Link href="/login" aria-label="Log in">
        <User className="h-5 w-5" />
      </Link>
    </Button>
  );
}