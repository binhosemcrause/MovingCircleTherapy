import { API_BASE_URL } from './config';

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: ApiUser;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

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

async function postAuth(path: string, payload: unknown): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Request failed.', response.status, data.details);
  }

  return data as AuthResponse;
}

export function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return postAuth('/auth/register', payload);
}

export function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return postAuth('/auth/login', payload);
}
