'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { registerCustomer, getCurrentCustomer } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useCustomerAuthStore } from '@/store/customerAuthStore';
import { registerSchema, type RegisterFormValues } from '@/lib/validators/customerAuth';

interface RegisterFormProps {
  redirectTo: string;
}

export function RegisterForm({ redirectTo }: RegisterFormProps) {
  const router = useRouter();
  const setCustomer = useCustomerAuthStore((state) => state.setCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    try {
      await registerCustomer({
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        password: values.password,
      });
      // Same reasoning as LoginForm — register's response also has no `addresses` field.
      const customer = await getCurrentCustomer();
      setCustomer(customer);
      toast.success(`Welcome, ${customer.name}`);
      router.push(redirectTo);
    } catch (error) {
      toast.error('Could not create account', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-xs font-medium text-muted-foreground">
          Full name
        </label>
        <input
          id="name"
          {...register('name')}
          className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
          Phone number
        </label>
        <input
          id="phone"
          placeholder="03001234567"
          {...register('phone')}
          className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
        <p className="mt-1 text-xs text-muted-foreground">
          Enter at least an email or a phone number.
        </p>
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
        {isSubmitting ? 'Creating account…' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Log in
        </Link>
      </p>
    </form>
  );
}