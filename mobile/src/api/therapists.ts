import { apiFetch } from './client';

export interface ApiTherapist {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  specialties: string[];
  photoUrl: string | null;
}

export function listTherapists(): Promise<ApiTherapist[]> {
  return apiFetch<ApiTherapist[]>('/therapists');
}
