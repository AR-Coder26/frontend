import { useEffect, useState } from 'react';
import { getAdminOrderNotificationCount } from '@/lib/api/orders';

/** Polls GET /admin/orders/notifications/count every 30s while mounted — this is the ONLY
 *  place in the admin panel that polls; everything else is fetch-on-navigation, which is
 *  enough for a low-order-volume store (see client's own explicit "manual is fine for now,
 *  order volume is low" decision in the project context). A badge that can go stale for up
 *  to 30 seconds is an acceptable tradeoff against adding a websocket/SSE layer for this. */
export function useAdminOrderNotifications(enabled: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function fetchCount() {
      try {
        const result = await getAdminOrderNotificationCount();
        if (!cancelled) setCount(result.count);
      } catch {
        // Silent — a stale/failed badge count isn't worth interrupting the admin with a toast.
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled]);

  return count;
}
