import { getPublicStoreSettings } from '@/lib/api/storeSettings';
import { CheckoutPageClient } from '@/components/checkout/CheckoutPageClient';

export default async function CheckoutPage() {
  const storeSettings = await getPublicStoreSettings();
  return <CheckoutPageClient storeSettings={storeSettings} />;
}