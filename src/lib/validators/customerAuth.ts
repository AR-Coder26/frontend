// frontend/src/lib/validators/customerAuth.ts
import { z } from 'zod';
import { PK_PHONE_REGEX } from '@/lib/constants';

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email or phone number'),
  password: z.string().min(1, 'Enter your password'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter your full name'),
    email: z.string().email('Enter a valid email').optional().or(z.literal('')),
    phone: z
      .string()
      .regex(PK_PHONE_REGEX, 'Enter a valid Pakistani mobile number')
      .optional()
      .or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: 'Enter at least an email or a phone number',
    path: ['email'],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;