'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { placeOrder } from '@/lib/api/orders';
import { ApiError } from '@/lib/api/client';
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validators/checkout';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { OrderSummary } from './OrderSummary';
import type { Order, StoreSettingsPublic } from '@/types';

interface CheckoutFormProps {
  storeSettings: StoreSettingsPublic;
  onOrderPlaced: (order: Order) => void;
}

export function CheckoutForm({ storeSettings, onOrderPlaced }: CheckoutFormProps) {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'COD', city: '' },
  });

  const watchedCity = watch('city') ?? '';
  const watchedPaymentMethod = watch('paymentMethod');

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  // The backend HARD-REJECTS (400 "Minimum order value is Rs. X") an order below this — see
  // order.controller.js. Disabling the submit here prevents a doomed round trip; the same
  // rule is also surfaced as a warning in OrderSummary.
  const isBelowMinimum = storeSettings.minOrderValue > 0 && subtotal < storeSettings.minOrderValue;

  async function onSubmit(values: CheckoutFormValues) {
    setIsSubmitting(true);
    try {
      const order = await placeOrder({
        customer: {
          name: values.name,
          phone: values.phone,
          whatsappNumber: values.whatsappNumber || undefined,
          email: values.email || undefined,
        },
        shippingAddress: {
          addressLine: values.addressLine,
          city: values.city,
          postalCode: values.postalCode || undefined,
        },
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        paymentMethod: values.paymentMethod,
      });

      clearCart();
      onOrderPlaced(order);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Could not place order', { description: error.message });
      } else {
        toast.error('Could not place order', { description: 'Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section>
          <h2 className="font-display text-lg text-foreground">Contact</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
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
              <label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
                Phone number
              </label>
              <input
                id="phone"
                placeholder="03001234567"
                {...register('phone')}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                We confirm every order by phone call — this number must be reachable.
              </p>
            </div>

            <div>
              <label htmlFor="whatsappNumber" className="text-xs font-medium text-muted-foreground">
                WhatsApp number (optional)
              </label>
              <input
                id="whatsappNumber"
                placeholder="Same as phone if left blank"
                {...register('whatsappNumber')}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.whatsappNumber && (
                <p className="mt-1 text-xs text-destructive">{errors.whatsappNumber.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">Delivery address</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="addressLine" className="text-xs font-medium text-muted-foreground">
                Address
              </label>
              <input
                id="addressLine"
                {...register('addressLine')}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.addressLine && (
                <p className="mt-1 text-xs text-destructive">{errors.addressLine.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="text-xs font-medium text-muted-foreground">
                City
              </label>
              <input
                id="city"
                {...register('city')}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
            </div>

            <div>
              <label htmlFor="postalCode" className="text-xs font-medium text-muted-foreground">
                Postal code (optional)
              </label>
              <input
                id="postalCode"
                {...register('postalCode')}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">Payment method</h2>
          <div className="mt-3">
            <PaymentMethodSelector
              storeSettings={storeSettings}
              value={watchedPaymentMethod}
              onChange={(method) => setValue('paymentMethod', method)}
            />
          </div>
        </section>
      </div>

      <div className="h-fit lg:sticky lg:top-24">
        <OrderSummary items={items} city={watchedCity} storeSettings={storeSettings} />
        <Button
          type="submit"
          size="lg"
          className="mt-4 w-full"
          disabled={isSubmitting || isBelowMinimum}
        >
          {isSubmitting ? 'Placing order…' : 'Place Order'}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          We&rsquo;ll call you to confirm your order before it ships.
        </p>
      </div>
    </form>
  );
}