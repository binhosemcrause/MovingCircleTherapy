export interface AvailabilitySlot {
  id: string;
  serviceId: string;
  startsAt: Date;
  endsAt: Date;
  isBooked: boolean;
  appointmentId: string | null;
}
