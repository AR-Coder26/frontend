import type { OrderStatus } from '@/types';

export const SIZES = ['S', 'M', 'L', 'XL'] as const;

export const FABRIC_STATUSES = ['stitched', 'unstitched'] as const;

export const FABRIC_TYPES = [
  'Lawn',
  'Cotton',
  'Khaddar',
  'Chiffon',
  'Silk',
  'Georgette',
  'Linen',
  'Other',
] as const;

export const PIECE_COUNTS = [1, 2, 3] as const;

export const PAYMENT_METHODS = ['COD', 'JazzCash', 'EasyPaisa', 'BankTransfer'] as const;

export const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

/** Human-readable labels for UI display — the enum VALUES themselves (used as keys here)
 *  must never be paraphrased anywhere they're sent to or compared against the backend. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
};

/** Semantic color token per status, for badges (see the `success`/`warning`/`destructive`
 *  tokens defined in globals.css). */
export const ORDER_STATUS_COLOR: Record<OrderStatus, 'warning' | 'accent' | 'success' | 'destructive'> = {
  Pending: 'warning',
  Confirmed: 'accent',
  Shipped: 'accent',
  Delivered: 'success',
  Cancelled: 'destructive',
};

/** Mirrors the hard-enforced transition map in order.controller.js exactly — used to
 *  disable/hide status options in the admin UI that the server would reject with a 409
 *  anyway, so the admin never hits a confusing error after the fact. */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
};

/** Pakistani mobile format the backend validators require: 03XXXXXXXXX or +923XXXXXXXXX. */
export const PK_PHONE_REGEX = /^(\+92|0)3\d{9}$/;

/** Optional field — either empty, or a valid PK IBAN (PKxx XXXX xxxxxxxxxxxxxxxx). */
export const PK_IBAN_REGEX = /^$|^PK\d{2}[A-Z]{4}\d{16}$/i;

export function isKarachiCity(city: string): boolean {
  return city.trim().toLowerCase() === 'karachi';
}