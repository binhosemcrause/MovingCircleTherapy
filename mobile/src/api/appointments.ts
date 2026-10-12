import { apiFetch } from './client';
import { ApiTherapist } from './therapists';

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
  therapist: ApiTherapist | null;
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

export interface BookAppointmentInput {
  serviceId: string;
  therapistId: string;
  scheduledAt: string;
}

export function bookAppointment(input: BookAppointmentInput): Promise<ApiAppointment> {
  return apiFetch<ApiAppointment>('/appointments', { method: 'POST', body: JSON.stringify(input) });
}
