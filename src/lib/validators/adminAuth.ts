import { z } from 'zod';

/** Mirrors backend/src/validators/auth.validator.js's adminLoginValidator exactly:
 *  email required + valid email, password just required (no min-length check at login —
 *  the min-8 rule only applies at password-CHANGE time, see adminChangePasswordSchema). */
export const adminLoginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

/** Mirrors adminChangePasswordValidator: currentPassword just required, newPassword min 8. */
export const adminChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});
export type AdminChangePasswordFormValues = z.infer<typeof adminChangePasswordSchema>;
