import { supabase } from './supabase/client';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

type ApiErrorBody = { detail?: string | { msg?: string }[]; message?: string };

export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const errorMessage = async (response: Response): Promise<string> => {
  const fallback = `Request failed (${response.status})`;
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail)) return body.detail.map((item) => item.msg || 'Invalid request').join(', ');
    return body.message || fallback;
  } catch {
    return fallback;
  }
};

export const apiRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new ApiError(401, 'Your session has expired. Please sign in again.');

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) throw new ApiError(response.status, await errorMessage(response));
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};
