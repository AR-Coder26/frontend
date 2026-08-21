import { LoginForm } from '@/components/auth/LoginForm';

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectParam } = await searchParams;

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-sm">
        <h1 className="text-center font-display text-2xl text-foreground">Log In</h1>
        <div className="mt-6">
          <LoginForm redirectTo={redirectParam || '/'} />
        </div>
      </div>
    </div>
  );
}