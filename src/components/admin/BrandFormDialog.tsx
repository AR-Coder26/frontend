'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { SingleImagePicker } from '@/components/admin/SingleImagePicker';
import { createBrand, updateBrand } from '@/lib/api/brands';
import { ApiError } from '@/lib/api/client';
import { brandFormSchema, type BrandFormValues } from '@/lib/validators/adminBrand';
import type { Brand } from '@/types';

interface BrandFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onSaved: (brand: Brand) => void;
}

export function BrandFormDialog({ open, onOpenChange, brand, onSaved }: BrandFormDialogProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormValues>({ resolver: zodResolver(brandFormSchema) });

  useEffect(() => {
    if (open) {
      reset({ name: brand?.name ?? '', isActive: brand?.isActive ?? true });
      setLogoFile(null);
    }
  }, [open, brand, reset]);

  async function onSubmit(values: BrandFormValues) {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      // Same reasoning as CategoryFormDialog: createBrandValidator has no isActive field at
      // all, only send it on the update path.
      if (brand) formData.append('isActive', String(values.isActive));
      // Field name is "logo", NOT "image" — matches the backend's upload.single('logo') and
      // differs deliberately from categories (see lib/api/brands.ts's doc comment).
      if (logoFile) formData.append('logo', logoFile);

      const saved = brand ? await updateBrand(brand._id, formData) : await createBrand(formData);
      onSaved(saved);
      toast.success(brand ? 'Brand updated' : 'Brand created');
      onOpenChange(false);
    } catch (error) {
      toast.error('Could not save brand', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{brand ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} invalid={!!errors.name} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <Controller
            control={control}
            name="isActive"
            render={({ field }) =>
              brand ? (
                <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2.5">
                  <span className="text-sm text-neutral-700">Active (visible on storefront)</span>
                  <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                </div>
              ) : (
                <></>
              )
            }
          />

          <SingleImagePicker label="Brand Logo" existingImage={brand?.logo ?? null} onChange={setLogoFile} />

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : brand ? 'Save Changes' : 'Create Brand'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
