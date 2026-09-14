import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Provide a valid email'),
  password: z.string().min(1, 'Password is required'),
  honeypot: z.string().optional(),
});
export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

/** Mirrors adminChangePasswordValidator: currentPassword just required, newPassword min 8. */
export const adminChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});
export type AdminChangePasswordFormValues = z.infer<typeof adminChangePasswordSchema>;

export const adminForgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Provide a valid email'),
  honeypot: z.string().optional(),
});
export type AdminForgotPasswordFormValues = z.infer<typeof adminForgotPasswordSchema>;

export const adminVerifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .length(6, 'Enter all 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only digits'),
  honeypot: z.string().optional(),
});
export type AdminVerifyOtpFormValues = z.infer<typeof adminVerifyOtpSchema>;

export const adminResetPasswordWithOtpSchema = z
  .object({
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
    honeypot: z.string().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type AdminResetPasswordWithOtpFormValues = z.infer<typeof adminResetPasswordWithOtpSchema>;