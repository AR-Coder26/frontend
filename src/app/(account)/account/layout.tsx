import { RequireCustomerAuth } from '@/components/auth/RequireCustomerAuth';
import { AccountNav } from '@/components/account/AccountNav';

export default function AccountSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireCustomerAuth>
      <div className="container grid grid-cols-1 gap-6 py-8 md:grid-cols-4 md:gap-8">
        <AccountNav />
        <div className="min-w-0 md:col-span-3">{children}</div>
      </div>
    </RequireCustomerAuth>
  );
}