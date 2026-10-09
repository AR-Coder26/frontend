const API_URL = process.env.NEXT_PUBLIC_API_URL;
const USE_API_PROXY = process.env.NEXT_PUBLIC_API_PROXY === 'true';

// Must match the `source` prefix of the rewrite in next.config.ts.
const API_PROXY_PATH = '/api';

// Server-side only (SSR / `next build`): give up on a backend that never answers instead of
// hanging the page. Browser calls are left alone — uploads and AI chat replies can be slow.
const SERVER_REQUEST_TIMEOUT_MS = 15_000;

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

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && USE_API_PROXY) return API_PROXY_PATH;

  if (!API_URL) {
    // No silent localhost fallback: a missing variable in production must be loud, not a
    // mysterious "failed to fetch" against the visitor's own machine.
    throw new ApiError(
      500,
      'NEXT_PUBLIC_API_URL is not set. Add it to the frontend environment (see .env.local.example) and rebuild.'
    );
  }
  return API_URL.replace(/\/+$/, '');
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | object;
  /** Internal — set by adminRequest/customerRequest. Never pass this yourself. */
  refreshPath?: string;
  /** Internal — prevents infinite refresh loops. Never pass this yourself. */
  _isRetry?: boolean;
}

// ─── Single-flight token refresh ──────────────────────────────────────────────────────────
// The backend ROTATES the refresh token on every /refresh call, so the old one stops working
// the moment a refresh succeeds. If several requests expire together (a dashboard loads many
// at once) and each fired its own refresh, all but the first would present a stale token,
// get 401, and the app would cascade into 401s and a forced logout. Instead, every request
// that needs a refresh waits on ONE shared attempt per refresh endpoint.
const refreshInFlight = new Map<string, Promise<boolean>>();

function refreshSession(refreshPath: string): Promise<boolean> {
  const existing = refreshInFlight.get(refreshPath);
  if (existing) return existing;

  const attempt = (async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}${refreshPath}`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false; // network failure == "could not refresh"; never throws into callers
    } finally {
      refreshInFlight.delete(refreshPath);
    }
  })();

  refreshInFlight.set(refreshPath, attempt);
  return attempt;
}

/** One shared, single-flight refresh attempt. Used by the session probes in auth.ts so that a
 *  returning visitor whose short-lived access cookie has expired is refreshed WITHOUT first
 *  provoking a 401 from a protected endpoint. */
export const refreshCustomerSession = () => refreshSession(CUSTOMER_REFRESH_PATH);
export const refreshAdminSession = () => refreshSession(ADMIN_REFRESH_PATH);

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { refreshPath, _isRetry, headers, body, ...rest } = options;
  const isBrowser = typeof window !== 'undefined';
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isPlainObject = body !== undefined && !isFormData && typeof body === 'object';

  const signal = rest.signal ?? (isBrowser ? undefined : AbortSignal.timeout(SERVER_REQUEST_TIMEOUT_MS));

  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}${path}`, {
      ...rest,
      signal,
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
  } catch (error) {
    if (error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new ApiError(504, 'The store is taking too long to respond. Please try again.');
    }
    throw error;
  }

  const json = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    // One refresh attempt, one retry — never more. The retry carries `_isRetry`, and the refresh
    // call itself goes through refreshSession() (not request()), so a failing /refresh can never
    // trigger another refresh. If it fails, fall through and surface the original 401.
    if (res.status === 401 && refreshPath && !_isRetry && isBrowser) {
      if (await refreshSession(refreshPath)) {
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

/** `{a: 1, b: undefined, c: ''}` -> `'?a=1'`. Shared by every list endpoint's query params.
 *  Same `object` reasoning as RequestOptions.body above ProductListParams etc. need to be
 *  assignable here without an index signature. */
export function buildQueryString(params: object): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') usp.set(key, String(value));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}
