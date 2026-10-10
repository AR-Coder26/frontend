import { z } from 'zod';

// Mirrors the backend's staff.validator.js so people see the same rules inline.
const assignedPassword = z
  .string()
  .min(8, 'At least 8 characters')
  .max(72, 'At most 72 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/[0-9]/, 'Include at least one number');

export const staffCreateSchema = z.object({
  name: z.string().trim().min(2, 'Enter the employee name').max(80, 'Max 80 characters'),
  email: z.string().trim().email('Enter a valid email address'),
  employeeId: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{3,20}$/, '3-20 characters: letters, numbers, dash or underscore'),
  password: assignedPassword,
});
export type StaffCreateValues = z.infer<typeof staffCreateSchema>;

export const staffPasswordSchema = z.object({ password: assignedPassword });
export type StaffPasswordValues = z.infer<typeof staffPasswordSchema>;
