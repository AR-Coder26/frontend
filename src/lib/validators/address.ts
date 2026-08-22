import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().trim().max(30, 'Label is too long').optional().or(z.literal('')),
  addressLine: z
    .string()
    .trim()
    .min(1, 'Enter a full address')
    .max(200, 'Address is too long (max 200 characters)'),
  city: z.string().trim().min(1, 'Enter a city').max(50, 'City name is too long'),
  postalCode: z.string().trim().max(10, 'Postal code is too long').optional().or(z.literal('')),
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;