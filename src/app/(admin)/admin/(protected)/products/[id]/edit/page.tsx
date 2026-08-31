'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { VariantEditor } from '@/components/admin/VariantEditor';
import { ProductImageManager } from '@/components/admin/ProductImageManager';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  getAdminProductById,
  updateProduct,
  deleteProduct,
  addProductImages,
  deleteProductImage,
} from '@/lib/api/products';
import { getAdminCategories } from '@/lib/api/categories';
import { getAdminBrands } from '@/lib/api/brands';
import { ApiError } from '@/lib/api/client';
import { productFormSchema, serializeVariantsForApi, type ProductFormValues } from '@/lib/validators/adminProduct';
import { FABRIC_TYPES, PIECE_COUNTS } from '@/lib/constants';
import type { Category, Brand, Product, ImageAsset } from '@/types';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productFormSchema) });

  const applyProductToForm = useCallback(
    (p: Product) => {
      reset({
        name: p.name,
        description: p.description,
        category: p.category._id,
        brand: p.brand?._id ?? '',
        fabricType: p.fabricType,
        pieceCount: p.pieceCount,
        isCustomStitchingAvailable: p.isCustomStitchingAvailable,
        discountPercentage: p.discountPercentage,
        isActive: p.isActive,
        variants: p.variants.map((v) => ({
          _id: v._id,
          color: v.color,
          size: v.size,
          fabricStatus: v.fabricStatus,
          price: v.price,
          comparePrice: v.comparePrice ?? '',
          stock: v.stock,
        })),
      });
    },
    [reset]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [p, cats, brs] = await Promise.all([
          getAdminProductById(productId),
          getAdminCategories(),
          getAdminBrands(),
        ]);
        if (cancelled) return;
        setProduct(p);
        setCategories(cats);
        setBrands(brs);
        applyProductToForm(p);
      } catch (error) {
        if (cancelled) return;
        setLoadError(error instanceof ApiError ? error.message : 'Could not load this product.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [productId, applyProductToForm]);

  async function onSubmit(values: ProductFormValues) {
    try {
      const payload = {
        name: values.name,
        description: values.description,
        category: values.category,
        brand: values.brand,
        fabricType: values.fabricType,
        pieceCount: values.pieceCount,
        isCustomStitchingAvailable: values.isCustomStitchingAvailable,
        discountPercentage: values.discountPercentage,
        isActive: values.isActive,
        // Always included on save (not conditionally) — the backend only reconciles
        // variants when this key is present at all, and removing a row here really does
        // delete that variant + its Cloudinary images server-side (confirmed directly
        // against product.controller.js's updateProduct — the removed-variant diff runs
        // against whatever `_id`s ARE present in this array), so this save button is the
        // one place that reconciliation intentionally happens.
        variants: serializeVariantsForApi(values.variants),
      };
      const updated = await updateProduct(productId, payload);
      setProduct(updated);
      applyProductToForm(updated);
      toast.success('Product updated');
    } catch (error) {
      toast.error('Could not save changes', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  async function handleDeleteProduct() {
    try {
      await deleteProduct(productId);
      toast.success('Product deleted');
      router.push('/admin/products');
    } catch (error) {
      toast.error('Could not delete product', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
      throw error;
    }
  }

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-neutral-500">Loading product…</div>;
  }

  if (loadError || !product) {
    return (
      <div className="py-16 text-center text-sm text-neutral-500">
        <p>{loadError ?? 'Product not found.'}</p>
        <Link href="/admin/products" className="mt-3 inline-block text-sm font-medium text-neutral-900 hover:underline">
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  const variantImagesById: Record<string, ImageAsset[]> = Object.fromEntries(
    product.variants.map((v) => [v._id, v.images])
  );

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
      </Link>
      <AdminPageHeader
        title={product.name}
        description={`Slug: ${product.slug}`}
        action={
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)} className="flex items-center gap-1.5">
            <Trash2 className="h-3.5 w-3.5" /> Delete Product
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-neutral-900">General Information</h3>
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
                  {FABRIC_TYPES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="pieceCount">Piece Count</Label>
                <Select id="pieceCount" {...register('pieceCount')} invalid={!!errors.pieceCount}>
                  {PIECE_COUNTS.map((p) => (
                    <option key={p} value={p}>{p}-Piece</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="discountPercentage">Discount % (0 = no discount)</Label>
                <Input id="discountPercentage" type="number" min="0" max="100" {...register('discountPercentage')} invalid={!!errors.discountPercentage} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2.5">
              <span className="text-sm text-neutral-700">Custom stitching available for this product</span>
              <Switch {...register('isCustomStitchingAvailable')} />
            </div>

            <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2.5">
              <span className="text-sm text-neutral-700">Active (visible on storefront)</span>
              <Switch {...register('isActive')} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-neutral-900">General Gallery</h3>
          <ProductImageManager
            label="Product Images (up to 8)"
            existingImages={product.images}
            maxFiles={8}
            onUpload={async (files) => {
              const formData = new FormData();
              files.forEach((f) => formData.append('images', f));
              const updated = await addProductImages(product._id, formData);
              setProduct(updated);
            }}
            onDelete={async (publicId) => {
              const updated = await deleteProductImage(product._id, publicId);
              setProduct(updated);
            }}
          />
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="mb-1 text-sm font-semibold text-neutral-900">Variants</h3>
          <p className="mb-4 text-xs text-neutral-500">
            Removing a variant and saving permanently deletes it and its photos — this cannot be undone.
          </p>
          <VariantEditor
            control={control}
            register={register}
            errors={errors}
            productId={product._id}
            variantImagesById={variantImagesById}
            onVariantImagesUpdated={(updated) => setProduct(updated)}
          />
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete "${product.name}"?`}
        description="This permanently deletes the product and all of its images. This cannot be undone."
        onConfirm={handleDeleteProduct}
      />
    </div>
  );
}
