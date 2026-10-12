export interface Therapist {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  specialties: string[];
  photoUrl: string | null;
  // Inactive therapists are hidden from the public list and can't be booked.
  isActive: boolean;
  // Sort order in the list, lowest first.
  position: number;
}
