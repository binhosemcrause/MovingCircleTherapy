import { apiFetch } from './client';

export interface ApiAppointmentService {
  id: string;
  name: string;
  category: string;
  description: string;
  durationMinutes: { min: number; max: number };
  price: number;
  currency: string;
  formats: ('in_person' | 'virtual')[];
  features: string[];
  imageUrl: string | null;
}

export interface ApiAppointment {
  id: string;
  service: ApiAppointmentService;
  userId: string;
  scheduledAt: string;
  format: 'in_person' | 'virtual';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  createdAt: string;
}

export function listAppointments(): Promise<ApiAppointment[]> {
  return apiFetch<ApiAppointment[]>('/appointments');
}
