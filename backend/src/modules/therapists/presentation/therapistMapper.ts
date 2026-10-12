import type { Therapist } from '../domain/Therapist';

export function toTherapistResponse(therapist: Therapist) {
  return {
    id: therapist.id,
    firstName: therapist.firstName,
    lastName: therapist.lastName,
    title: therapist.title,
    bio: therapist.bio,
    specialties: therapist.specialties,
    photoUrl: therapist.photoUrl,
    isActive: therapist.isActive,
    position: therapist.position,
  };
}
