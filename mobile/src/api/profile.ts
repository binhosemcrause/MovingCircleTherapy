import { apiFetch } from './client';
import { ApiUser } from './auth';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  tagline?: string;
  avatarUrl?: string;
}

export function getProfile(): Promise<ApiUser> {
  return apiFetch<ApiUser>('/profile');
}

export function updateProfile(payload: UpdateProfilePayload): Promise<ApiUser> {
  return apiFetch<ApiUser>('/profile', { method: 'PATCH', body: JSON.stringify(payload) });
}
