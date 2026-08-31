'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loginCustomer, getCurrentCustomer } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useCustomerAuthStore } from '@/store/customerAuthStore';
import { loginSchema, type LoginFormValues } from '@/lib/validators/customerAuth';
import { buildStoreWhatsAppLink } from '@/lib/whatsapp';

interface LoginFormProps {
  redirectTo: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const setCustomer = useCustomerAuthStore((state) => state.setCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // There is no password-reset endpoint anywhere on the backend (checked every auth route/
  // controller — no forgot/reset logic exists at all, deliberately or not). Rather than link
  // to a page that doesn't exist, this reuses the store's own WhatsApp support channel —
  // already the primary support channel for orders/returns throughout this project — with a
  // pre-filled message. Returns null (and the link simply isn't rendered) if the store's
  // WhatsApp number isn't configured, same rule every other caller of this helper follows.
  const forgotPasswordLink = buildStoreWhatsAppLink(
    "Hi! I forgot my account password and need help logging in."
  );

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
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
            Password
          </label>
          {forgotPasswordLink && (
            <a
              href={forgotPasswordLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary hover:text-primary-hover"
            >
              Forgot password?
            </a>
          )}
        </div>
        <div className="relative mt-1">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className="w-full rounded-md border border-input bg-card px-3 py-2 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
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