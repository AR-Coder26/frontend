'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loginAdmin } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminLoginSchema, type AdminLoginFormValues } from '@/lib/validators/adminAuth';

interface AdminLoginFormProps {
  redirectTo: string;
}

export function AdminLoginForm({ redirectTo }: AdminLoginFormProps) {
  const router = useRouter();
  const status = useAdminAuthStore((state) => state.status);
  const sessionCheckError = useAdminAuthStore((state) => state.sessionCheckError);
  const setAdmin = useAdminAuthStore((state) => state.setAdmin);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({ resolver: zodResolver(adminLoginSchema) });

  // Redirect to the specified page if the user is already authenticated. This is a one-time effect that runs on mount and whenever the status or redirect to changes. It ensures that authenticated users are not shown the login form and are instead redirected to the appropriate page.
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(redirectTo);
    }
  }, [status, redirectTo, router]);

  async function onSubmit(values: AdminLoginFormValues) {
    setIsSubmitting(true);
    try {
      // Unlike loginCustomer (which returns a deliberately-incomplete CustomerAuthSummary,
      // requiring a follow-up /auth/me call), loginAdmin's response IS already the full
      // AdminUser shape — see backend adminAuth.controller.js's login handler and
      // lib/api/auth.ts's return type. No follow-up getCurrentAdmin() call needed here.
      const admin = await loginAdmin(values);
      setAdmin(admin);
      toast.success(`Welcome back, ${admin.name}`);
      router.push(redirectTo);
    } catch (error) {
      // Backend rate-limits this endpoint at 10/15min (adminAuth.routes.js) — a 429 surfaces
      // through ApiError like any other error and gets the same message treatment here.
      toast.error('Could not log in', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Covers three states deliberately: 'idle'/'loading' means the one-time session check
  // (AdminAuthInitializer, mounted in the outer admin/layout.tsx) hasn't resolved yet —
  // show a neutral placeholder rather than flash the form. 'authenticated' means the effect
  // above is already redirecting away — also don't flash the form mid-redirect. Only render
  // the actual form once we're certain there is no valid session.
  if (status === 'idle' || status === 'loading' || status === 'authenticated') {
    return <div className="py-8 text-center text-sm text-neutral-500">Checking session…</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {sessionCheckError && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {sessionCheckError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          {...register('email')}
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Password
        </label>
        <div className="relative mt-1">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password')}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
      >
        {isSubmitting ? 'Logging in…' : 'Log In'}
      </Button>

      {/*
        Deliberately NOT a "Forgot password?" link — there is no reset endpoint anywhere on
        the backend (checked every admin auth route/controller). The real, documented
        recovery path is the createAdmin.js CLI script's reset mode, run by whoever has
        server access — see backend PROJECT_STATE §12 item 6. A clickable link with nowhere
        real to go would be exactly the kind of placeholder this build was asked to avoid, so
        this is plain, honest text instead.
      */}
      <p className="text-center text-xs text-neutral-400">
        Forgot your password? Ask whoever has server access to reset it via the
        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-[11px]">createAdmin.js</code>
        script.
      </p>
      <p className="text-center text-xs text-neutral-400">
        Admin accounts are provisioned by the developer — there is no self-service sign-up.
      </p>
    </form>
  );
}
