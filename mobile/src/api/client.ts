import { API_BASE_URL } from './config';

export interface ApiErrorDetail {
  field?: string;
  issue: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...init?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Request failed.', response.status, data.details);
  }

  return data as T;
}
