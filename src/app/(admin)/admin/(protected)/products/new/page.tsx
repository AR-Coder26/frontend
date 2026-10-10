'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { VariantEditor } from '@/components/admin/VariantEditor';
import { MultiImagePicker } from '@/components/admin/MultiImagePicker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { createProduct } from '@/lib/api/products';
import { getAdminCategories } from '@/lib/api/categories';
import { getAdminBrands } from '@/lib/api/brands';
import { ApiError } from '@/lib/api/client';
import { makeProductFormSchema, serializeVariantsForApi, type ProductFormValues } from '@/lib/validators/adminProduct';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { FABRIC_TYPES, PIECE_COUNTS } from '@/lib/constants';
import type { Category, Brand } from '@/types';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [generalImages, setGeneralImages] = useState<File[]>([]);
  const isOwner = useAdminAuthStore((s) => s.admin?.role === 'admin');
  const resolver = useMemo(() => zodResolver(makeProductFormSchema({ isOwner })), [isOwner]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver,
    defaultValues: {
      name: '',
      description: '',
      category: '',
      brand: '',
      fabricType: undefined,
      pieceCount: undefined,
      isCustomStitchingAvailable: false,
      discountPercentage: 0,
      isActive: true,
      variants: [{ color: '', size: 'M', fabricStatus: 'stitched', price: 0, comparePrice: '', costPrice: '', stock: 0 }],
    },
  });

  useEffect(() => {
    Promise.all([getAdminCategories(), getAdminBrands()])
      .then(([cats, brs]) => {
        setCategories(cats.filter((c) => c.isActive));
        setBrands(brs.filter((b) => b.isActive));
      })
      .catch(() => {
        toast.error('Could not load categories/brands', {
          description: 'Refresh the page to try again.',
        });
      });
  }, []);

  async function onSubmit(values: ProductFormValues) {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('category', values.category);
      formData.append('brand', values.brand);
      formData.append('fabricType', values.fabricType);
      formData.append('pieceCount', String(values.pieceCount));
      formData.append('isCustomStitchingAvailable', String(values.isCustomStitchingAvailable));
      formData.append('discountPercentage', String(values.discountPercentage));
      formData.append('variants', JSON.stringify(serializeVariantsForApi(values.variants)));
      generalImages.forEach((file) => formData.append('images', file));

      const created = await createProduct(formData);
      toast.success('Product created — add per-variant photos on the next screen.');
      // The two-step flow (backend PROJECT_STATE §6/§9) means variant-specific images can
      // only be uploaded once each variant has a real _id, which only exists after this
      // first save — so the natural next stop is the edit page, not back to the list.
      router.push(`/admin/products/${created._id}/edit`);
    } catch (error) {
      toast.error('Could not create product', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
      </Link>
      <AdminPageHeader title="Add Product" description="General info and variants first — per-variant photos come after saving." />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">General Information</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" {...register('name')} invalid={!!errors.name} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register('description')} invalid={!!errors.description} />
              {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select id="category" {...register('category')} invalid={!!errors.category}>
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </Select>
                {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Select id="brand" {...register('brand')} invalid={!!errors.brand}>
                  <option value="">Select brand…</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </Select>
                {errors.brand && <p className="mt-1 text-xs text-destructive">{errors.brand.message}</p>}
              </div>
              <div>
                <Label htmlFor="fabricType">Fabric Type</Label>
                <Select id="fabricType" {...register('fabricType')} invalid={!!errors.fabricType}>
                  <option value="">Select fabric…</option>
                  {FABRIC_TYPES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </Select>
                {errors.fabricType && <p className="mt-1 text-xs text-destructive">{errors.fabricType.message}</p>}
              </div>
              <div>
                <Label htmlFor="pieceCount">Piece Count</Label>
                <Select id="pieceCount" {...register('pieceCount')} invalid={!!errors.pieceCount}>
                  <option value="">Select…</option>
                  {PIECE_COUNTS.map((p) => (
                    <option key={p} value={p}>{p}-Piece</option>
                  ))}
                </Select>
                {errors.pieceCount && <p className="mt-1 text-xs text-destructive">{errors.pieceCount.message}</p>}
              </div>
              <div>
                <Label htmlFor="discountPercentage">Discount % (0 = no discount)</Label>
                <Input id="discountPercentage" type="number" min="0" max="100" {...register('discountPercentage')} invalid={!!errors.discountPercentage} />
                <p className="mt-1 text-[11px] text-muted-foreground">30 or higher shows up in the storefront&apos;s 30% OFF filter.</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <span className="text-sm text-foreground/80">Custom stitching available for this product</span>
              <Switch {...register('isCustomStitchingAvailable')} />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <span className="text-sm text-foreground/80">Active (visible on storefront)</span>
              {/* No explicit defaultChecked needed — useForm's defaultValues.isActive above
                  already sets the initial checked state via RHF's uncontrolled ref binding. */}
              <Switch {...register('isActive')} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">General Gallery</h3>
          <MultiImagePicker label="Product Images (up to 8)" maxFiles={8} files={generalImages} onChange={setGeneralImages} />
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Variants</h3>
          <p className="mb-4 text-xs text-muted-foreground">Each color/size/type combination needs its own price and stock.</p>
          <VariantEditor control={control} register={register} errors={errors} isOwner={isOwner} />
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
