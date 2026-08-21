import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABELS } from '@/lib/constants';
import type { OrderStatus } from '@/types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge variant={ORDER_STATUS_COLOR[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}