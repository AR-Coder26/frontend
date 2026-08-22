'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { addMyAddress, updateMyAddress } from '@/lib/api/addresses';
import { ApiError } from '@/lib/api/client';
import { addressSchema, type AddressFormValues } from '@/lib/validators/address';
import type { Address } from '@/types';

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = adding a new address. A real Address = editing that one. */
  address: Address | null;
  onSaved: (addresses: Address[]) => void;
}

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
  onSaved,
}: AddressFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({ resolver: zodResolver(addressSchema) });

  // Re-seed the form whenever a DIFFERENT address is opened for editing (or the dialog
  // switches to "add new") — RHF doesn't automatically pick up prop changes on its own.
  useEffect(() => {
    if (open) {
      reset({
        label: address?.label ?? '',
        addressLine: address?.addressLine ?? '',
        city: address?.city ?? '',
        postalCode: address?.postalCode ?? '',
        isDefault: address?.isDefault ?? false,
      });
    }
  }, [open, address, reset]);

  async function onSubmit(values: AddressFormValues) {
    try {
      const payload = {
        label: values.label || undefined,
        addressLine: values.addressLine,
        city: values.city,
        postalCode: values.postalCode || undefined,
        isDefault: values.isDefault,
      };
      // Checks `address` directly (not a separately-computed `isEditing` boolean) so
      // TypeScript can narrow `address._id` as defined in this branch — same reasoning as
      // the stock-check fix in ProductPurchasePanel.tsx.
      const updated = address
        ? await updateMyAddress(address._id, payload)
        : await addMyAddress(payload);
      onSaved(updated);
      toast.success(address ? 'Address updated' : 'Address added');
    } catch (error) {
      toast.error('Could not save address', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{address ? 'Edit Address' : 'Add Address'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label htmlFor="label" className="text-xs font-medium text-muted-foreground">
              Label (optional)
            </label>
            <input
              id="label"
              placeholder="Home, Office…"
              {...register('label')}
              className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.label && <p className="mt-1 text-xs text-destructive">{errors.label.message}</p>}
          </div>

          <div>
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

          <div className="grid grid-cols-2 gap-3">
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
                Postal code
              </label>
              <input
                id="postalCode"
                {...register('postalCode')}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              {...register('isDefault')}
              className="h-4 w-4 rounded border-input"
            />
            Set as default address
          </label>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : address ? 'Save Changes' : 'Add Address'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}