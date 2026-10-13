// A start time at which at least one therapist can take the service.
export interface AvailabilitySlot {
  startsAt: Date;
  endsAt: Date;
  // Therapists free for this slot, in list order.
  therapistIds: string[];
}
