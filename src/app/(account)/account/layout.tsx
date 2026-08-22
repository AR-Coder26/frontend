import { RequireCustomerAuth } from '@/components/auth/RequireCustomerAuth';
import { AccountNav } from '@/components/account/AccountNav';

export default function AccountSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireCustomerAuth>
      <div className="container grid gap-8 py-8 md:grid-cols-4">
        <AccountNav />
        <div className="md:col-span-3">{children}</div>
      </div>
    </RequireCustomerAuth>
  );
}