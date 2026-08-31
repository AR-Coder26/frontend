import { z } from 'zod';
import { SIZES, FABRIC_STATUSES, FABRIC_TYPES, PIECE_COUNTS } from '@/lib/constants';

export const variantFormSchema = z.object({
  _id: z.string().optional(),
  color: z.string().trim().min(1, 'Color is required'),
  size: z.enum(SIZES, { errorMap: () => ({ message: 'Select a size' }) }),
  fabricStatus: z.enum(FABRIC_STATUSES, { errorMap: () => ({ message: 'Select stitched or unstitched' }) }),
  price: z.coerce.number({ invalid_type_error: 'Price is required' }).min(0, 'Price cannot be negative'),
  comparePrice: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
  stock: z.coerce.number({ invalid_type_error: 'Stock is required' }).min(0, 'Stock cannot be negative'),
}).refine(
  (v) => v.comparePrice === '' || v.comparePrice === undefined || Number(v.comparePrice) >= v.price,
  { message: 'Compare-at price must be >= price', path: ['comparePrice'] }
);

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150, 'Max 150 characters'),
  description: z.string().trim().min(1, 'Description is required'),
  category: z.string().min(1, 'Select a category'),
  brand: z.string().min(1, 'Select a brand'),
  fabricType: z.enum(FABRIC_TYPES, { errorMap: () => ({ message: 'Select a fabric type' }) }),
  pieceCount: z.coerce.number().refine((v) => (PIECE_COUNTS as readonly number[]).includes(v), {
    message: 'Select a piece count',
  }),
  isCustomStitchingAvailable: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0, 'Cannot be negative').max(100, 'Cannot exceed 100'),
  isActive: z.boolean().default(true),
  variants: z.array(variantFormSchema).min(1, 'At least one variant is required'),
});
export type ProductFormValues = z.infer<typeof productFormSchema>;

export function serializeVariantsForApi(variants: ProductFormValues['variants']) {
  return variants.map((v) => {
    const { _id, color, size, fabricStatus, price, comparePrice, stock } = v;
    const base = { color, size, fabricStatus, price: Number(price), stock: Number(stock) };
    return {
      ...(_id ? { _id } : {}),
      ...base,
      ...(comparePrice !== '' && comparePrice !== undefined ? { comparePrice: Number(comparePrice) } : {}),
    };
  });
}
