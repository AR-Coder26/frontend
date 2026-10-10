import { adminRequest } from './client';
import type { MonthlyReport } from '@/types';

/** Owner-only. `month` is YYYY-MM in Pakistan time; omit for the current month. */
export function getMonthlyReport(month?: string) {
  return adminRequest<MonthlyReport>(`/admin/analytics/monthly${month ? `?month=${encodeURIComponent(month)}` : ''}`);
}
