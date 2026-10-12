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

export interface ApiAvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
}

// `from` / `to` are calendar dates (YYYY-MM-DD).
export function listAvailability(serviceId: string, from: string, to: string): Promise<ApiAvailabilitySlot[]> {
  return apiFetch<ApiAvailabilitySlot[]>(`/services/${serviceId}/availability?from=${from}&to=${to}`);
}
