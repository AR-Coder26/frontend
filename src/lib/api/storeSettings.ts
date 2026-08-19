import { adminRequest, request } from './client';
import type { StoreSettingsAdmin, StoreSettingsPublic } from '@/types';

/**
 * Powers the checkout page's payment method options. Treat a `null` method as "don't render
 * this option at all" — it means the admin has it turned off (or it isn't fully configured
 * yet, since the server won't let isActive:true save without accountTitle/accountNumber
 * filled in). Never render a payment method as a disabled/greyed option; a null one simply
 * isn't offered.
 */
export function getPublicStoreSettings() {
  return request<StoreSettingsPublic>('/store-settings');
}

/** Full singleton doc including every isActive flag — powers the admin settings form. */
export function getAdminStoreSettings() {
  return adminRequest<StoreSettingsAdmin>('/admin/store-settings');
}

export interface UpdateStoreSettingsPayload {
  jazzCash?: Partial<{ accountTitle: string; accountNumber: string; instructions: string; isActive: boolean }>;
  easyPaisa?: Partial<{ accountTitle: string; accountNumber: string; instructions: string; isActive: boolean }>;
  bankTransfer?: Partial<{
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    instructions: string;
    isActive: boolean;
  }>;
  minOrderValue?: number;
  deliveryFlatRateNonKarachi?: number;
}

/**
 * Partial update — each top-level key (jazzCash/easyPaisa/bankTransfer) is merged with the
 * existing sub-document server-side, not replaced wholesale. IMPORTANT: the server rejects
 * `isActive: true` for any method still missing its required fields (accountTitle +
 * accountNumber, or bankName + accountTitle + accountNumber for BankTransfer) — surface that
 * 400 message directly, it already names which fields are missing.
 */
export function updateStoreSettings(payload: UpdateStoreSettingsPayload) {
  return adminRequest<StoreSettingsAdmin>('/admin/store-settings', {
    method: 'PATCH',
    body: payload,
  });
}