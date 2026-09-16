import { z } from 'zod';
import { SOCIAL_ICON_OPTIONS, type SocialIconName } from '@/lib/socialIcons';

const SOCIAL_ICON_VALUES = SOCIAL_ICON_OPTIONS.map((opt) => opt.value) as [
  SocialIconName,
  ...SocialIconName[],
];

export const socialLinkFormSchema = z.object({
  platformName: z.string().trim().min(1, 'Platform name is required').max(40, 'Max 40 characters'),
  iconName: z.enum(SOCIAL_ICON_VALUES, { errorMap: () => ({ message: 'Choose an icon' }) }),
  targetUrl: z
    .string()
    .trim()
    .min(1, 'Target URL is required')
    .url('Must be a full URL, e.g. https://facebook.com/yourpage')
    .refine((url) => /^https?:\/\//i.test(url), 'URL must start with http:// or https://'),
  displayOrder: z.coerce.number().int('Must be a whole number').min(0, 'Cannot be negative').default(0),
  isActive: z.boolean().default(true),
});
export type SocialLinkFormValues = z.infer<typeof socialLinkFormSchema>;