import { z } from 'zod';
import { PK_PHONE_REGEX, PAYMENT_METHODS } from '@/lib/constants';

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  // Always required regardless of login state — the admin's core anti-fraud mechanism is a
  // phone CALL to confirm every order (see PROJECT_STATE.md), not OTP.
  phone: z
    .string()
    .regex(PK_PHONE_REGEX, 'Enter a valid Pakistani mobile number (e.g. 03001234567)'),
  whatsappNumber: z
    .string()
    .regex(PK_PHONE_REGEX, 'Enter a valid Pakistani mobile number')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  addressLine: z
    .string()
    .trim()
    .min(1, 'Enter your delivery address')
    .max(200, 'Address is too long (max 200 characters)'),
  city: z.string().trim().min(1, 'Enter your city').max(50, 'City name is too long'),
  postalCode: z.string().trim().max(10, 'Postal code is too long').optional().or(z.literal('')),
  paymentMethod: z.enum(PAYMENT_METHODS),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;