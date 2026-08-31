'use client';

import { useState } from 'react';
import { useFieldArray, type Control, type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProductImageManager } from '@/components/admin/ProductImageManager';
import { addVariantImages, deleteVariantImage } from '@/lib/api/products';
import { SIZES, FABRIC_STATUSES } from '@/lib/constants';
import type { ProductFormValues } from '@/lib/validators/adminProduct';
import type { ImageAsset, Product } from '@/types';

interface VariantEditorProps {
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
  /** Only present when editing an already-created product — new-product rows never have a
   *  real productId/variantId yet, so per-variant image management can't exist until after
   *  the first save (this mirrors the backend's own two-step design, not a limitation added
   *  here — see backend PROJECT_STATE §6 & §9). */
  productId?: string;
  /** Current images per already-persisted variant (_id -> images), for display only — images
   *  aren't part of the editable form state, they save immediately via their own endpoint. */
  variantImagesById?: Record<string, ImageAsset[]>;
  onVariantImagesUpdated?: (updatedProduct: Product) => void;
}

export function VariantEditor({
  control,
  register,
  errors,
  productId,
  variantImagesById = {},
  onVariantImagesUpdated,
}: VariantEditorProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });
  const [expandedImages, setExpandedImages] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const variantId = field._id;
        const rowErrors = errors.variants?.[index];
        const canManageImages = Boolean(productId && variantId);

        return (
          <div key={field.id} className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1 block text-[11px] font-medium text-neutral-500">Color</label>
                <Input {...register(`variants.${index}.color`)} placeholder="Sky Blue" invalid={!!rowErrors?.color} />
                {rowErrors?.color && <p className="mt-1 text-[11px] text-destructive">{rowErrors.color.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-neutral-500">Size</label>
                <Select {...register(`variants.${index}.size`)} invalid={!!rowErrors?.size}>
                  <option value="">Select…</option>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-neutral-500">Type</label>
                <Select {...register(`variants.${index}.fabricStatus`)} invalid={!!rowErrors?.fabricStatus}>
                  <option value="">Select…</option>
                  {FABRIC_STATUSES.map((s) => (
                    <option key={s} value={s}>{s === 'stitched' ? 'Stitched' : 'Unstitched'}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-neutral-500">Price (Rs.)</label>
                <Input type="number" step="1" min="0" {...register(`variants.${index}.price`)} invalid={!!rowErrors?.price} />
                {rowErrors?.price && <p className="mt-1 text-[11px] text-destructive">{rowErrors.price.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-neutral-500">Compare-at (optional)</label>
                <Input type="number" step="1" min="0" {...register(`variants.${index}.comparePrice`)} invalid={!!rowErrors?.comparePrice} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-neutral-500">Stock</label>
                <Input type="number" step="1" min="0" {...register(`variants.${index}.stock`)} invalid={!!rowErrors?.stock} />
                {rowErrors?.stock && <p className="mt-1 text-[11px] text-destructive">{rowErrors.stock.message}</p>}
              </div>
            </div>
            {rowErrors?.comparePrice && (
              <p className="mt-1 text-[11px] text-destructive">{rowErrors.comparePrice.message as string}</p>
            )}

            <div className="mt-3 flex items-center justify-between">
              {canManageImages ? (
                <button
                  type="button"
                  onClick={() => setExpandedImages(expandedImages === field.id ? null : field.id)}
                  className="flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  {expandedImages === field.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  Variant images ({(variantImagesById[variantId!] ?? []).filter((i) => i.url).length})
                </button>
              ) : (
                <span className="text-xs text-neutral-400">
                  {productId ? 'Save to add images for this new variant' : 'Images can be added after the product is created'}
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(index)}
                className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove variant
              </button>
            </div>

            {canManageImages && expandedImages === field.id && (
              <div className="mt-3 border-t border-neutral-200 pt-3">
                <ProductImageManager
                  label="Variant Images"
                  existingImages={variantImagesById[variantId!] ?? []}
                  maxFiles={6}
                  onUpload={async (files) => {
                    const formData = new FormData();
                    files.forEach((f) => formData.append('images', f));
                    const updated = await addVariantImages(productId!, variantId!, formData);
                    onVariantImagesUpdated?.(updated);
                  }}
                  onDelete={async (publicId) => {
                    const updated = await deleteVariantImage(productId!, variantId!, publicId);
                    onVariantImagesUpdated?.(updated);
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {typeof errors.variants?.message === 'string' && (
        <p className="text-xs text-destructive">{errors.variants.message}</p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ color: '', size: 'M', fabricStatus: 'stitched', price: 0, comparePrice: '', stock: 0 })
        }
        className="flex items-center gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" /> Add Variant
      </Button>
    </div>
  );
}
