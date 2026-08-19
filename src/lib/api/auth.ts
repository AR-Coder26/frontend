import { request, adminRequest, customerRequest } from './client';
import type { AdminUser, Customer, CustomerAuthSummary } from '@/types';

// ---------- Customer ----------

export interface RegisterPayload {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}

/** At least one of email/phone is required — enforced server-side by auth.validator.js,
 *  so the frontend form must validate the same "at least one" rule before submitting. */
export function registerCustomer(payload: RegisterPayload) {
  return request<CustomerAuthSummary>('/auth/register', { method: 'POST', body: payload });
}

export interface LoginPayload {
  /** Email OR phone — the backend looks this up via Customer.findByIdentifier(). */
  identifier: string;
  password: string;
}

export function loginCustomer(payload: LoginPayload) {
  return request<CustomerAuthSummary>('/auth/login', { method: 'POST', body: payload });
}

export function logoutCustomer() {
  return request<null>('/auth/logout', { method: 'POST' });
}

/** Only this endpoint returns `addresses` — register/login deliberately don't. */
export function getCurrentCustomer() {
  return customerRequest<Customer>('/auth/me');
}

// ---------- Admin ----------

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export function loginAdmin(payload: AdminLoginPayload) {
  return request<AdminUser>('/admin/auth/login', { method: 'POST', body: payload });
}

export function logoutAdmin() {
  return request<null>('/admin/auth/logout', { method: 'POST' });
}

export function getCurrentAdmin() {
  return adminRequest<AdminUser>('/admin/auth/me');
}

export interface ChangeAdminPasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/** Clears the admin's session cookies on success — the caller must redirect to
 *  /admin/login afterwards, the server does not do this for you. */
export function changeAdminPassword(payload: ChangeAdminPasswordPayload) {
  return adminRequest<null>('/admin/auth/change-password', { method: 'PATCH', body: payload });
}