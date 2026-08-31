import { z } from 'zod';
import { PK_IBAN_REGEX } from '@/lib/constants';

const walletAccountSchema = z
  .object({
    accountTitle: z.string().trim().max(100).optional().or(z.literal('')),
    accountNumber: z.string().trim().max(50).optional().or(z.literal('')),
    instructions: z.string().trim().max(500).optional().or(z.literal('')),
    isActive: z.boolean(),
  })
  .refine((v) => !v.isActive || (v.accountTitle && v.accountNumber), {
    message: 'Account title and account number are required to activate this method',
    path: ['isActive'],
  });

const bankAccountSchema = z
  .object({
    bankName: z.string().trim().max(100).optional().or(z.literal('')),
    accountTitle: z.string().trim().max(100).optional().or(z.literal('')),
    accountNumber: z.string().trim().max(50).optional().or(z.literal('')),
    iban: z
      .string()
      .trim()
      .regex(PK_IBAN_REGEX, 'Must be a valid Pakistani IBAN (PKxx XXXX xxxxxxxxxxxxxxxx)')
      .optional()
      .or(z.literal('')),
    instructions: z.string().trim().max(500).optional().or(z.literal('')),
    isActive: z.boolean(),
  })
  .refine((v) => !v.isActive || (v.bankName && v.accountTitle && v.accountNumber), {
    message: 'Bank name, account title, and account number are required to activate this method',
    path: ['isActive'],
  });

export const storeSettingsFormSchema = z.object({
  jazzCash: walletAccountSchema,
  easyPaisa: walletAccountSchema,
  bankTransfer: bankAccountSchema,
  minOrderValue: z.coerce.number().min(0, 'Cannot be negative'),
  deliveryFlatRateNonKarachi: z.coerce.number().min(0, 'Cannot be negative'),
});
export type StoreSettingsFormValues = z.infer<typeof storeSettingsFormSchema>;
