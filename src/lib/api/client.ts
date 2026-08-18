// Base URL of the Express backend (see .env.local.example). Defaults match
// backend/.env.example's PORT=5000 and CLIENT_URL=http://localhost:3000 for local dev.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const ADMIN_REFRESH_PATH = '/admin/auth/refresh';
const CUSTOMER_REFRESH_PATH = '/auth/refresh';

/** Client-side mirror of the backend's error envelope: { success:false, message, errors? }. */
export class ApiError extends Error {
  statusCode: number;
  fieldErrors?: { field: string; message: string }[];

  constructor(
    statusCode: number,
    message: string,
    fieldErrors?: { field: string; message: string }[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** FormData for multipart uploads, or a plain object that gets JSON.stringify'd for you. */
  body?: BodyInit | Record<string, unknown>;
  /** Internal — set by adminRequest/customerRequest. Never pass this yourself. */
  refreshPath?: string;
  /** Internal — prevents infinite refresh loops. Never pass this yourself. */
  _isRetry?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { refreshPath, _isRetry, headers, body, ...rest } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isPlainObject = body !== undefined && !isFormData && typeof body === 'object';

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    body: isPlainObject ? JSON.stringify(body) : (body as BodyInit | undefined),
    // Every route in this backend is cookie-authenticated (HTTP-only JWT cookies) — there is
    // no Bearer token to attach, but the browser will only send those cookies at all if
    // `credentials: 'include'` is set on every single request, same-origin or not.
    credentials: 'include',
    headers: {
      // Never set Content-Type on a FormData body — the browser must set its own
      // multipart boundary, and a manual header here silently breaks Multer's parsing.
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  });

  const json = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && refreshPath && !_isRetry) {
      const refreshRes = await fetch(`${API_BASE_URL}${refreshPath}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        return request<T>(path, { ...options, _isRetry: true });
      }
    }
    throw new ApiError(
      json?.statusCode ?? res.status,
      json?.message ?? 'Something went wrong. Please try again.',
      json?.errors
    );
  }

  // Every success envelope is { statusCode, success, message, data } — we only ever want `data`.
  return (json?.data ?? null) as T;
}

/** For routes behind `protectAdmin` — auto-retries once via /admin/auth/refresh on a 401. */
export function adminRequest<T>(path: string, options: RequestOptions = {}) {
  return request<T>(path, { ...options, refreshPath: ADMIN_REFRESH_PATH });
}

/** For routes behind `protectCustomer` — auto-retries once via /auth/refresh on a 401. */
export function customerRequest<T>(path: string, options: RequestOptions = {}) {
  return request<T>(path, { ...options, refreshPath: CUSTOMER_REFRESH_PATH });
}

/** `{a: 1, b: undefined, c: ''}` -> `'?a=1'`. Shared by every list endpoint's query params. */
export function buildQueryString(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') usp.set(key, String(value));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}