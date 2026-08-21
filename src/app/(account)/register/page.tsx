import { RegisterForm } from '@/components/auth/RegisterForm';

interface RegisterPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { redirect: redirectParam } = await searchParams;

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-sm">
        <h1 className="text-center font-display text-2xl text-foreground">Create Account</h1>
        <div className="mt-6">
          <RegisterForm redirectTo={redirectParam || '/'} />
        </div>
      </div>
    </div>
  );
}