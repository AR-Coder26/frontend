'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { loginCustomer, getCurrentCustomer } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useCustomerAuthStore } from '@/store/customerAuthStore';
import { loginSchema, type LoginFormValues } from '@/lib/validators/customerAuth';

interface LoginFormProps {
  redirectTo: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const setCustomer = useCustomerAuthStore((state) => state.setCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    try {
      await loginCustomer(values);
      // loginCustomer's response (CustomerAuthSummary) deliberately has no `addresses` field
      // — see types/index.ts. Fetch the full Customer shape once via /auth/me so the store
      // holds the complete type immediately rather than an incomplete stand-in.
      const customer = await getCurrentCustomer();
      setCustomer(customer);
      toast.success(`Welcome back, ${customer.name}`);
      router.push(redirectTo);
    } catch (error) {
      toast.error('Could not log in', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="identifier" className="text-xs font-medium text-muted-foreground">
          Email or phone number
        </label>
        <input
          id="identifier"
          {...register('identifier')}
          className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.identifier && (
          <p className="mt-1 text-xs text-destructive">{errors.identifier.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in…' : 'Log In'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/register" className="font-medium text-primary hover:text-primary-hover">
          Create an account
        </Link>
      </p>
    </form>
  );
}