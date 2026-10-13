import { z } from 'zod';

export const listTherapistsQuerySchema = z.object({
  includeInactive: z.enum(['true', 'false']).optional(),
});

export const therapistIdParamsSchema = z.object({
  therapistId: z.string().uuid(),
});

export const therapistAccountSchema = z.object({
  email: z.string().trim().email(),
});

const therapistFields = {
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  title: z.string().trim().min(1),
  bio: z.string(),
  specialties: z.array(z.string().trim().min(1)),
  photoUrl: z.string().url(),
  email: z.string().email(),
  isActive: z.boolean(),
  position: z.number().int().nonnegative(),
};

export const createTherapistSchema = z.object({
  firstName: therapistFields.firstName,
  lastName: therapistFields.lastName,
  title: therapistFields.title,
  bio: therapistFields.bio.optional(),
  specialties: therapistFields.specialties.optional(),
  photoUrl: therapistFields.photoUrl.optional(),
  email: therapistFields.email.optional(),
  isActive: therapistFields.isActive.optional(),
  position: therapistFields.position.optional(),
});

export const updateTherapistSchema = z
  .object(therapistFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided.' });
