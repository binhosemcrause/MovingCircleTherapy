export const SERVICE_CATEGORIES = [
  'counselling',
  'creative_arts_therapy',
  'therapeutic_workshops',
  'family_therapy',
  'couple_movement_therapy',
  'dance_movement_therapy',
  'creative_arts_classes',
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const SESSION_FORMATS = ['in_person', 'virtual'] as const;
export type SessionFormat = (typeof SESSION_FORMATS)[number];

export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const RESOURCE_TYPES = ['article', 'worksheet', 'video', 'tool'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];
