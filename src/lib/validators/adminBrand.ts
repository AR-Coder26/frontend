import { z } from 'zod';

export const brandFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60, 'Max 60 characters'),
  isActive: z.boolean().default(true),
});
export type BrandFormValues = z.infer<typeof brandFormSchema>;
