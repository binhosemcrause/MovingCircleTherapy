import type { AvailabilitySlot } from './AvailabilitySlot';

export interface AvailabilityDateRange {
  from?: Date;
  to?: Date;
}

export interface IAvailabilityRepository {
  findByService(serviceId: string, range: AvailabilityDateRange): Promise<AvailabilitySlot[]>;
  findOpenSlot(serviceId: string, startsAt: Date): Promise<AvailabilitySlot | null>;
  findById(id: string): Promise<AvailabilitySlot | null>;
  findByAppointmentId(appointmentId: string): Promise<AvailabilitySlot | null>;
  markBooked(id: string, appointmentId: string): Promise<void>;
  release(id: string): Promise<void>;
}
