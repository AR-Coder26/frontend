import { getPublicStoreSettings } from '@/lib/api/storeSettings';
import { formatPKR } from '@/lib/utils';
import { formatPaymentMethods } from '@/lib/seo';

/**
 * Values substituted into the {PAYMENTS} and {DELIVERY_RATE} tokens in seoContent.ts, so the
 * copy always matches what the admin has configured (payment methods, non-Karachi delivery fee).
 * Falls back to neutral wording if the settings call fails, so SEO copy never breaks a page.
 */
export async function getCopyVars(): Promise<Record<string, string>> {
  try {
    const settings = await getPublicStoreSettings();
    return {
      PAYMENTS: formatPaymentMethods(settings),
      DELIVERY_RATE: formatPKR(settings.deliveryFlatRateNonKarachi),
    };
  } catch {
    return { PAYMENTS: 'Cash on Delivery', DELIVERY_RATE: 'a flat rate' };
  }
}
