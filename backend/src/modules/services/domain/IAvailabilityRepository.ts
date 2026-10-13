import type { AvailabilitySlot } from './AvailabilitySlot';

// Calendar dates (YYYY-MM-DD) in the practice's timezone, both inclusive.
export interface AvailabilityDateRange {
  from?: string;
  to?: string;
}

export interface OpenSlotFilter {
  // Only count this therapist as free.
  therapistId?: string;
  // Ignore this appointment when working out who is busy (rescheduling).
  excludeAppointmentId?: string;
}

export interface IAvailabilityRepository {
  findOpenSlots(serviceId: string, range: AvailabilityDateRange): Promise<AvailabilitySlot[]>;
  findOpenSlotAt(serviceId: string, startsAt: Date, filter?: OpenSlotFilter): Promise<AvailabilitySlot | null>;
}
