import { customerRequest } from './client';
import type { Address } from '@/types';

// Every one of these returns the customer's FULL updated addresses array, not just the
// single address that changed (confirmed against customerAddress.controller.js) — so the
// UI can always just replace its whole local list with the response, no manual merging.

export function getMyAddresses() {
  return customerRequest<Address[]>('/my-addresses');
}

export interface AddressPayload {
  label?: string;
  addressLine: string;
  city: string;
  postalCode?: string;
  isDefault?: boolean;
}

/** The very first address a customer ever adds is auto-set as default server-side,
 *  regardless of what `isDefault` is sent as. */
export function addMyAddress(payload: AddressPayload) {
  return customerRequest<Address[]>('/my-addresses', { method: 'POST', body: payload });
}

export function updateMyAddress(addressId: string, payload: Partial<AddressPayload>) {
  return customerRequest<Address[]>(`/my-addresses/${addressId}`, {
    method: 'PUT',
    body: payload,
  });
}

/** If the deleted address was the default, the server auto-promotes the next remaining
 *  address to default — never leaves a customer with zero default addresses. */
export function deleteMyAddress(addressId: string) {
  return customerRequest<Address[]>(`/my-addresses/${addressId}`, { method: 'DELETE' });
}