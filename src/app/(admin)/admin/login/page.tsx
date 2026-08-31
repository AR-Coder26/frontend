import { AdminLoginForm } from '@/components/auth/AdminLoginForm';

interface AdminLoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { redirect: redirectParam } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">Brandox Admin</h1>
          <p className="mt-1 text-sm text-neutral-500">Log in to manage the store</p>
        </div>
        <AdminLoginForm redirectTo={redirectParam || '/admin/dashboard'} />
      </div>
    </div>
  );
}
