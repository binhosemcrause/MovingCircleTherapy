import { apiFetch, ApiError } from './client';

export { ApiError };

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

function postAuth(path: string, payload: unknown): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(path, { method: 'POST', body: JSON.stringify(payload) });
}

export function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return postAuth('/auth/register', payload);
}

export function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return postAuth('/auth/login', payload);
}
