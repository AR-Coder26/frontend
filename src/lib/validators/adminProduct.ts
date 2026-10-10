import { z } from 'zod';
import { SIZES, FABRIC_STATUSES, FABRIC_TYPES, PIECE_COUNTS } from '@/lib/constants';

// A blank number input is "" and z.coerce.number() turns "" into 0, so blanks must be mapped to
// "not provided" BEFORE coercion (otherwise an empty Compare-at silently became 0 and failed the
// refine below, and an empty cost would silently have been recorded as 0).
const optionalMoney = (label: string) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number({ invalid_type_error: `${label} must be a number` }).min(0, `${label} cannot be negative`).optional()
  );

export const variantFormSchema = z.object({
  _id: z.string().optional(),
  color: z.string().trim().min(1, 'Color is required'),
  size: z.enum(SIZES, { errorMap: () => ({ message: 'Select a size' }) }),
  fabricStatus: z.enum(FABRIC_STATUSES, { errorMap: () => ({ message: 'Select stitched or unstitched' }) }),
  price: z.coerce.number({ invalid_type_error: 'Price is required' }).min(0, 'Price cannot be negative'),
  comparePrice: optionalMoney('Compare-at price'),
  // What the item costs the store. Owner: required for every variant. Staff never receive stored
  // costs, so for them it is required only on NEW variants (see makeProductFormSchema).
  costPrice: optionalMoney('Cost price'),
  stock: z.coerce.number({ invalid_type_error: 'Stock is required' }).min(0, 'Stock cannot be negative'),
}).refine(
  (v) => v.comparePrice === undefined || Number(v.comparePrice) >= v.price,
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
export type ProductFormValues = z.input<typeof productFormSchema>;

/**
 * Role-aware schema. The backend is the authority (it rejects any variant that ends up without a
 * cost); this just gives the person an inline error first.
 *  - owner: cost required on every variant (stored costs are returned to the owner and pre-filled)
 *  - staff: the saved cost is hidden from them, so blank means "keep the saved cost" for existing
 *    variants; cost is required only for variants being added now (no _id yet)
 */
export function makeProductFormSchema({ isOwner }: { isOwner: boolean }) {
  return productFormSchema.superRefine((values, ctx) => {
    values.variants.forEach((variant, index) => {
      const missing = variant.costPrice === undefined; // blank is mapped to undefined by optionalMoney
      const mustHaveCost = isOwner || !variant._id;
      if (missing && mustHaveCost) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['variants', index, 'costPrice'], message: 'Cost price is required' });
      }
    });
  });
}

export function serializeVariantsForApi(variants: ProductFormValues['variants']) {
  return variants.map((v) => {
    const { _id, color, size, fabricStatus, price, comparePrice, costPrice, stock } = v;
    const base = { color, size, fabricStatus, price: Number(price), stock: Number(stock) };
    return {
      ...(_id ? { _id } : {}),
      ...base,
      ...(comparePrice !== '' && comparePrice !== undefined ? { comparePrice: Number(comparePrice) } : {}),
      // omitted (not 0) when blank: the backend keeps the saved cost for existing variants
      ...(costPrice !== '' && costPrice !== undefined ? { costPrice: Number(costPrice) } : {}),
    };
  });
}
