import { apiFetch } from './client';

export interface ApiTherapist {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  specialties: string[];
  photoUrl: string | null;
  // Whether the therapist has a login to see their sessions with.
  hasAccount: boolean;
}

export function listTherapists(): Promise<ApiTherapist[]> {
  return apiFetch<ApiTherapist[]>('/therapists');
}

export interface CreateTherapistInput {
  firstName: string;
  lastName: string;
  title: string;
}

// Admin only.
export function createTherapist(input: CreateTherapistInput): Promise<ApiTherapist> {
  return apiFetch<ApiTherapist>('/therapists', { method: 'POST', body: JSON.stringify(input) });
}

export interface ApiTherapistAccount {
  email: string;
  role: 'therapist' | 'admin';
  // Null when the email already had an account, which keeps its password.
  temporaryPassword: string | null;
}

// Admin only. Gives the therapist a login under this email.
export function createTherapistAccount(therapistId: string, email: string): Promise<ApiTherapistAccount> {
  return apiFetch<ApiTherapistAccount>(`/therapists/${therapistId}/account`, {
    method: 'PUT',
    body: JSON.stringify({ email }),
  });
}
