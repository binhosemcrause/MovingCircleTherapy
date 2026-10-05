import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  tagline: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});
