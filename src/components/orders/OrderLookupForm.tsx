'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { orderLookupSchema, type OrderLookupFormValues } from '@/lib/validators/orderLookup';

interface OrderLookupFormProps {
  onSubmit: (values: OrderLookupFormValues) => void;
  isSubmitting: boolean;
}

export function OrderLookupForm({ onSubmit, isSubmitting }: OrderLookupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderLookupFormValues>({ resolver: zodResolver(orderLookupSchema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-sm space-y-4">
      <div>
        <label htmlFor="orderNumber" className="text-xs font-medium text-muted-foreground">
          Order number
        </label>
        <input
          id="orderNumber"
          placeholder="ORD-20260821-0001"
          {...register('orderNumber')}
          className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.orderNumber && (
          <p className="mt-1 text-xs text-destructive">{errors.orderNumber.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
          Phone number used for this order
        </label>
        <input
          id="phone"
          placeholder="03001234567"
          {...register('phone')}
          className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Looking up…' : 'Track Order'}
      </Button>
    </form>
  );
}