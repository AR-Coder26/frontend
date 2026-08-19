import { request, adminRequest, customerRequest, buildQueryString } from './client';
import type { Order, OrderStatus, Paginated, PaymentMethod } from '@/types';

// ---------- Guest / optional-auth ----------

export interface PlaceOrderPayload {
  customer: { name: string; phone: string; whatsappNumber?: string; email?: string };
  /** Send EITHER addressId (logged-in customer, saved address) OR shippingAddress (guest,
   *  or a one-off address) — never both. */
  addressId?: string;
  shippingAddress?: { addressLine: string; city: string; postalCode?: string };
  items: { productId: string; variantId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
}

/**
 * Auth here is OPTIONAL (attachCustomerIfLoggedIn middleware) — a missing or expired
 * customer cookie never 401s, the order just gets placed as a guest. That means there's
 * nothing for a refresh-and-retry to do, so this deliberately uses the plain `request()`,
 * not `customerRequest()`. Rate-limited to 10/hour per IP server-side.
 */
export function placeOrder(payload: PlaceOrderPayload) {
  return request<Order>('/orders', { method: 'POST', body: payload });
}

/** Rate-limited to 10/15min per IP server-side. */
export function lookupGuestOrder(orderNumber: string, phone: string) {
  return request<Order>(`/orders/lookup${buildQueryString({ orderNumber, phone })}`);
}

/** Rate-limited to 10/15min per IP server-side. */
export function cancelGuestOrder(orderNumber: string, phone: string, cancelReason?: string) {
  return request<Order>('/orders/cancel', {
    method: 'PATCH',
    body: { orderNumber, phone, cancelReason },
  });
}

// ---------- Customer (requires login) ----------

export function getMyOrders(page = 1, limit = 10) {
  return customerRequest<Paginated<'orders', Order>>(
    `/my-orders${buildQueryString({ page, limit })}`
  );
}

export function getMyOrderById(id: string) {
  return customerRequest<Order>(`/my-orders/${id}`);
}

/** Only allowed while `order.canBeCancelled` is true (i.e. status isn't Delivered/Cancelled). */
export function cancelMyOrder(id: string, cancelReason?: string) {
  return customerRequest<Order>(`/my-orders/${id}/cancel`, {
    method: 'PATCH',
    body: { cancelReason },
  });
}

// ---------- Admin ----------

export interface AdminOrderListParams {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export function getAdminOrders(params: AdminOrderListParams = {}) {
  return adminRequest<Paginated<'orders', Order>>(`/admin/orders${buildQueryString(params)}`);
}

/** Powers the admin nav's unseen-orders badge. */
export function getAdminOrderNotificationCount() {
  return adminRequest<{ count: number }>('/admin/orders/notifications/count');
}

/** Note: fetching a single order this way ALSO auto-marks it isSeenByAdmin server-side —
 *  no separate call needed if you're already showing the order detail page. */
export function getAdminOrderById(id: string) {
  return adminRequest<Order>(`/admin/orders/${id}`);
}

/** Explicit seen-marker for cases where you want to clear the badge WITHOUT opening the
 *  order detail page (e.g. a "mark all as seen" action on the list view). */
export function markOrderSeen(id: string) {
  return adminRequest<Order>(`/admin/orders/${id}/mark-seen`, { method: 'PATCH' });
}

export interface UpdateOrderStatusPayload {
  orderStatus?: OrderStatus;
  adminNotes?: string;
  cancelReason?: string;
}

/**
 * Returns 409 if the transition isn't in ORDER_STATUS_TRANSITIONS (see constants.ts), or if
 * moving to "Confirmed" while `firstMessageSent` is still false — uploadConfirmationProof()
 * below must succeed first in that case.
 */
export function updateOrderStatus(id: string, payload: UpdateOrderStatusPayload) {
  return adminRequest<Order>(`/admin/orders/${id}/status`, { method: 'PATCH', body: payload });
}

/** multipart/form-data — file field "screenshot" (singular, NOT "images"). OCR-verifies the
 *  order number + store branding appear in the image, then sets firstMessageSent = true. */
export function uploadConfirmationProof(id: string, formData: FormData) {
  return adminRequest<Order>(`/admin/orders/${id}/confirmation-proof`, {
    method: 'POST',
    body: formData,
  });
}