import {
  request,
  adminRequest,
  ApiError,
  refreshCustomerSession,
  refreshAdminSession,
} from './client';
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

interface CustomerSessionProbe {
  authenticated: boolean;
  canRefresh: boolean;
  customer: Customer | null;
}

/**
 * Session check run on every storefront page load. Uses GET /auth/session, which ALWAYS answers
 * 200 and says whether the visitor is signed in (and includes `addresses`, like /auth/me).
 * Anonymous visitors therefore cost one quiet request instead of `/auth/me` 401 + `/auth/refresh`
 * 401. If the short-lived access cookie expired but a refresh cookie exists, refresh first, then
 * ask again. `/auth/me` itself is unchanged and still returns 401 when logged out.
 * Throws ApiError(401) when there is no session — customerAuthStore treats that as "logged out".
 */
export async function getCurrentCustomer(): Promise<Customer> {
  let probe = await request<CustomerSessionProbe>('/auth/session');
  if (!probe.authenticated && probe.canRefresh && (await refreshCustomerSession())) {
    probe = await request<CustomerSessionProbe>('/auth/session');
  }
  if (probe.authenticated && probe.customer) return probe.customer;
  throw new ApiError(401, 'Not signed in');
}

// ---------- Admin ----------

export interface AdminLoginPayload {
  email: string;
  password: string;
  /** See adminLoginSchema's comment in lib/validators/adminAuth.ts — wired up for schema
   *  consistency even though the backend's /admin/auth/login route doesn't check it yet. */
  honeypot?: string;
}

export function loginAdmin(payload: AdminLoginPayload) {
  return request<AdminUser>('/admin/auth/login', { method: 'POST', body: payload });
}

export function logoutAdmin() {
  return request<null>('/admin/auth/logout', { method: 'POST' });
}

interface AdminSessionProbe {
  authenticated: boolean;
  canRefresh: boolean;
  admin: AdminUser | null;
}

/** Admin counterpart of getCurrentCustomer: GET /admin/auth/session never errors for a logged-out
 *  visitor (the login page runs this on every load). `/admin/auth/me` remains strict. */
export async function getCurrentAdmin(): Promise<AdminUser> {
  let probe = await request<AdminSessionProbe>('/admin/auth/session');
  if (!probe.authenticated && probe.canRefresh && (await refreshAdminSession())) {
    probe = await request<AdminSessionProbe>('/admin/auth/session');
  }
  if (probe.authenticated && probe.admin) return probe.admin;
  throw new ApiError(401, 'Not signed in');
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

// ---------------------------------------------------------------------------------------------
// Admin forgot-password / OTP flow. All three endpoints run BEFORE the admin has a session, so
// (like loginAdmin above) these use plain `request`, never `adminRequest` — there is no cookie
// to attach yet, and `adminRequest`'s auto-refresh-on-401 behavior would be meaningless here.
// ---------------------------------------------------------------------------------------------

export interface AdminForgotPasswordPayload {
  email: string;
  /** Always sent empty by real users — see HoneypotField.tsx and
   *  backend/src/middleware/honeypot.middleware.js for the full contract. */
  honeypot?: string;
}

/** Step 1. The backend ALWAYS responds 200 with the same generic message whether or not the
 *  email belongs to a real admin (enumeration-proof by design) — the resolved value here
 *  carries no signal either way, so callers should only use this to know the request didn't
 *  error out (rate-limited, network failure, etc.), never to infer "this email exists". */
export function forgotPasswordAdmin(payload: AdminForgotPasswordPayload) {
  return request<null>('/admin/auth/forgot-password', { method: 'POST', body: payload });
}

export interface AdminVerifyOtpPayload {
  email: string;
  otp: string;
  honeypot?: string;
}

/** Mirrors the backend's verify-otp success payload exactly. `resetToken` is a high-entropy,
 *  single-use, ~10-minute-lived opaque string — NOT the OTP itself — that must be presented to
 *  resetAdminPasswordWithOtp next. `expiresInMinutes` lets the UI start an accurate countdown
 *  for that window without hardcoding the backend's RESET_TOKEN_EXPIRY_MINUTES value twice. */
export interface AdminVerifyOtpResponse {
  resetToken: string;
  expiresInMinutes: number;
}

/** Step 2. On a wrong code, the backend's error message already includes the exact remaining
 *  attempts (e.g. "Invalid verification code. 2 attempt(s) remaining before lockout.") — the
 *  frontend just needs to surface `ApiError.message` as-is, no parsing required. A 423 response
 *  means the account just got locked (or already was); a 429 means the calling IP has been
 *  rate-limited. See AdminForgotPasswordFlow.tsx's error-branching for how each is handled. */
export function verifyAdminOtp(payload: AdminVerifyOtpPayload) {
  return request<AdminVerifyOtpResponse>('/admin/auth/verify-otp', { method: 'POST', body: payload });
}

export interface AdminResetPasswordPayload {
  email: string;
  resetToken: string;
  newPassword: string;
  honeypot?: string;
}

/** Step 3. A 401 here means the resetToken is invalid or its ~10-minute window has expired —
 *  the only recovery is starting the whole flow over from step 1, there's no "resend just the
 *  token" option (it's single-use by design, tied to the OTP verification that produced it). */
export function resetAdminPasswordWithOtp(payload: AdminResetPasswordPayload) {
  return request<null>('/admin/auth/reset-password', { method: 'POST', body: payload });
}