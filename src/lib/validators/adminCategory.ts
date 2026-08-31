import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60, 'Max 60 characters'),
  description: z.string().trim().max(500, 'Max 500 characters').optional().or(z.literal('')),
  displayOrder: z.coerce.number().int('Must be a whole number').min(0, 'Cannot be negative').default(0),
  isActive: z.boolean().default(true),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
