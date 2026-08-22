'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCustomerAuthStore } from '@/store/customerAuthStore';
import { logoutCustomer } from '@/lib/api/auth';

const LINKS = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'My Orders' },
  { href: '/account/addresses', label: 'My Addresses' },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const clearCustomer = useCustomerAuthStore((state) => state.clearCustomer);

  async function handleLogout() {
    try {
      await logoutCustomer();
    } finally {
      clearCustomer();
      toast.success('Logged out');
      router.push('/');
    }
  }

  return (
    <nav className="space-y-1">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`block rounded-md px-3 py-2 text-sm ${
            pathname === link.href
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground/80 hover:bg-secondary'
          }`}
        >
          {link.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={handleLogout}
        className="block w-full rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-secondary"
      >
        Log Out
      </button>
    </nav>
  );
}