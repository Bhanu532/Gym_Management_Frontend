'use client';

import { useCallback, useEffect, useState } from 'react';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface AuthUser {
  sub?: string;
  email: string;
  name: string;
  scope: 'platform' | 'tenant' | 'member';
  tenantId?: string | null;
  role?: string;
  permissions?: string[];
  branchIds?: string[];
}

const TOKEN_KEY = 'gym_access_token';
const REFRESH_KEY = 'gym_refresh_token';
const USER_KEY = 'gym_user';

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: Record<string, unknown>;
  constructor(message: string, status: number, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuth(data: { accessToken: string; refreshToken: string; user: AuthUser }): void {
  window.localStorage.setItem(TOKEN_KEY, data.accessToken);
  window.localStorage.setItem(REFRESH_KEY, data.refreshToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearAuth(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
}

async function parseResponse<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // non-JSON response
  }
  if (!res.ok) {
    throw new ApiError(
      body?.message ?? `Request failed with status ${res.status}`,
      res.status,
      body?.code,
      body?.details,
    );
  }
  if (!body) throw new ApiError('Empty response', res.status);
  return body.data;
}

// Fallback provider when API endpoint is unreachable or offline — intentionally
// REMOVED. Real SaaS data must always come from the tenant-scoped backend API.
// No mock data is used as the database source of truth.

async function request<T>(
  method: string,
  path: string,
  payload?: unknown,
  opts: { retry?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    });

    if (res.status === 401 && opts.retry !== false && getRefreshToken()) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return request<T>(method, path, payload, { retry: false });
      }
    }
    return await parseResponse<T>(res);
  } catch (err) {
    // No mock fallback. Errors (auth, validation, network) are surfaced to the
    // caller so real backend responses are always the source of truth.
    throw err;
  }
}

export async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const body = await res.json();
    if (res.ok && body?.data) {
      const existing = getStoredUser();
      window.localStorage.setItem(TOKEN_KEY, body.data.accessToken);
      window.localStorage.setItem(REFRESH_KEY, body.data.refreshToken);
      if (body.data.user) {
        window.localStorage.setItem(USER_KEY, JSON.stringify(body.data.user));
      } else if (existing) {
        window.localStorage.setItem(USER_KEY, JSON.stringify(existing));
      }
      return true;
    }
    clearAuth();
    return false;
  } catch {
    clearAuth();
    return false;
  }
}

export const api = {
  get: <T>(path: string, opts?: { retry?: boolean }) => request<T>('GET', path, undefined, opts),
  post: <T>(path: string, payload?: unknown, opts?: { retry?: boolean }) =>
    request<T>('POST', path, payload, opts),
  patch: <T>(path: string, payload?: unknown, opts?: { retry?: boolean }) =>
    request<T>('PATCH', path, payload, opts),
  put: <T>(path: string, payload?: unknown, opts?: { retry?: boolean }) =>
    request<T>('PUT', path, payload, opts),
  del: <T>(path: string, opts?: { retry?: boolean }) => request<T>('DELETE', path, undefined, opts),
};

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ accessToken: string; refreshToken: string; user: AuthUser }>(
      '/auth/login',
      { email, password },
      { retry: false },
    );
    setAuth(data);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {}, { retry: false });
    } catch {
      // ignore network errors on logout
    }
    clearAuth();
    setUser(null);
    window.location.href = '/login';
  }, []);

  return { user, loading, login, logout };
}
