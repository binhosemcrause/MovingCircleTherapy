import { apiFetch } from './client';

export interface ApiServiceSummary {
  id: string;
  name: string;
  category: string;
}

export interface ApiService extends ApiServiceSummary {
  description: string;
  durationMinutes: { min: number; max: number };
  price: number;
  currency: string;
  formats: ('in_person' | 'virtual')[];
  features: string[];
  imageUrl: string | null;
}

export function listServices(): Promise<ApiServiceSummary[]> {
  return apiFetch<ApiServiceSummary[]>('/services');
}

export function getService(serviceId: string): Promise<ApiService> {
  return apiFetch<ApiService>(`/services/${serviceId}`);
}
