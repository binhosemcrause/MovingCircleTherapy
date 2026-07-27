import { apiFetch } from './client';

export interface ApiService {
  id: string;
  name: string;
  category: string;
  description: string;
  durationMinutes: { min: number; max: number };
  price: number;
  currency: string;
  formats: ('in_person' | 'virtual')[];
  features: string[];
}

export function listServices(): Promise<ApiService[]> {
  return apiFetch<ApiService[]>('/services');
}
