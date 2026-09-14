import { ApiError } from '@/lib/api/client';

export type OtpErrorKind = 'invalidOrExpired' | 'lockedOut' | 'rateLimited' | 'unknown';

/**
 * Classifies an error from forgotPasswordAdmin / verifyAdminOtp / resetAdminPasswordWithOtp by
 * HTTP status code, so AdminForgotPasswordFlow.tsx can branch on a plain string instead of
 * repeating `error instanceof ApiError && error.statusCode === 423` at every call site.
 *
 *   423 (Locked)        -> the account just got locked, or already was, after 3 failed OTP
 *                          attempts (backend/src/controllers/adminAuth.controller.js). Show the
 *                          persistent lockout banner.
 *   429 (Too Many Reqs)  -> the CALLING IP hit one of the per-route rate limiters
 *                          (adminAuth.routes.js) — a shorter, transient condition unrelated to
 *                          the specific admin account. Show a toast, not the lockout banner.
 *   401 (Unauthorized)   -> wrong OTP / expired OTP / invalid or expired reset token — the
 *                          backend's message already says which and (for wrong OTP) how many
 *                          attempts remain, so just surface `error.message` verbatim.
 *   anything else        -> network failure, 500, etc.
 */
export function classifyOtpError(error: unknown): OtpErrorKind {
  if (!(error instanceof ApiError)) return 'unknown';
  if (error.statusCode === 423) return 'lockedOut';
  if (error.statusCode === 429) return 'rateLimited';
  if (error.statusCode === 401) return 'invalidOrExpired';
  return 'unknown';
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}