// frontend/src/components/chat/chatUtils.ts
import { ORDER_STATUSES } from '@/lib/constants';
import type { OrderStatus } from '@/types';

/** Routes arrive from the server, but a link is only followed if it is a same-site path —
 *  never an absolute URL, protocol-relative URL (`//evil.com`) or backslash trick. */
export function isSafeInternalRoute(route: string): boolean {
  return route.startsWith('/') && !route.startsWith('//') && !route.includes('\\');
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as string[]).includes(value);
}

export function formatChatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** True on phone-sized screens, where the chat panel is full-screen and should get out of the
 *  way after the customer follows a link. Matches Tailwind's `sm` breakpoint (640px). */
export function isSmallScreen(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;
}
