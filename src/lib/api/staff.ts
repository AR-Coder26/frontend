import { adminRequest } from './client';
import type { StaffMember } from '@/types';

// Owner-only endpoints: a staff account gets 403 from all of these.

export function getStaff() {
  return adminRequest<StaffMember[]>('/admin/staff');
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  employeeId: string;
  password: string;
}

export function createStaff(payload: CreateStaffPayload) {
  return adminRequest<StaffMember>('/admin/staff', { method: 'POST', body: payload });
}

export function updateStaff(id: string, payload: { name?: string; employeeId?: string; isActive?: boolean }) {
  return adminRequest<StaffMember>(`/admin/staff/${id}`, { method: 'PATCH', body: payload });
}

export function setStaffPassword(id: string, password: string) {
  return adminRequest<null>(`/admin/staff/${id}/password`, { method: 'PATCH', body: { password } });
}
