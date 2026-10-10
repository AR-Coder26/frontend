import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { AdminLoginForm } from '@/components/auth/AdminLoginForm';

interface AdminLoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { redirect: redirectParam } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle variant="icon" />
      </div>
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Brandox Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Log in to manage the store</p>
        </div>
        <AdminLoginForm redirectTo={redirectParam || '/admin/dashboard'} />
      </div>
    </div>
  );
}
