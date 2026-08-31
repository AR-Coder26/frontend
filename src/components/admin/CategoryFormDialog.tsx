'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { SingleImagePicker } from '@/components/admin/SingleImagePicker';
import { createCategory, updateCategory } from '@/lib/api/categories';
import { ApiError } from '@/lib/api/client';
import { categoryFormSchema, type CategoryFormValues } from '@/lib/validators/adminCategory';
import type { Category } from '@/types';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = creating a new category. A real Category = editing that one. */
  category: Category | null;
  onSaved: (category: Category) => void;
}

export function CategoryFormDialog({ open, onOpenChange, category, onSaved }: CategoryFormDialogProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({ resolver: zodResolver(categoryFormSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? '',
        description: category?.description ?? '',
        displayOrder: category?.displayOrder ?? 0,
        isActive: category?.isActive ?? true,
      });
      setImageFile(null);
    }
  }, [open, category, reset]);

  async function onSubmit(values: CategoryFormValues) {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      if (values.description) formData.append('description', values.description);
      formData.append('displayOrder', String(values.displayOrder));
      // createCategoryValidator has no isActive field at all (a brand-new category always
      // starts active) — only send it on the update path, matching the backend exactly.
      if (category) formData.append('isActive', String(values.isActive));
      if (imageFile) formData.append('image', imageFile);

      const saved = category
        ? await updateCategory(category._id, formData)
        : await createCategory(formData);

      onSaved(saved);
      toast.success(category ? 'Category updated' : 'Category created');
      onOpenChange(false);
    } catch (error) {
      toast.error('Could not save category', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} invalid={!!errors.name} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register('description')} invalid={!!errors.description} />
            {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input id="displayOrder" type="number" step="1" {...register('displayOrder')} invalid={!!errors.displayOrder} />
            <p className="mt-1 text-[11px] text-neutral-400">Lower numbers show first on the storefront.</p>
          </div>

          <Controller
            control={control}
            name="isActive"
            render={({ field }) =>
              category ? (
                <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2.5">
                  <span className="text-sm text-neutral-700">Active (visible on storefront)</span>
                  <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                </div>
              ) : (
                <></>
              )
            }
          />

          <SingleImagePicker label="Category Image" existingImage={category?.image ?? null} onChange={setImageFile} />

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : category ? 'Save Changes' : 'Create Category'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
