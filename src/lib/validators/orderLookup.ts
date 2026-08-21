import { z } from 'zod';
import { PK_PHONE_REGEX } from '@/lib/constants';

export const orderLookupSchema = z.object({
  orderNumber: z.string().trim().min(1, 'Enter your order number'),
  phone: z.string().regex(PK_PHONE_REGEX, 'Enter the phone number used for this order'),
});

export type OrderLookupFormValues = z.infer<typeof orderLookupSchema>;