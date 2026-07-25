import { z } from 'zod';
import { SERVICE_CATEGORIES, SESSION_FORMATS } from '../../../shared/domain/enums';

export const listServicesQuerySchema = z.object({
  category: z.enum(SERVICE_CATEGORIES).optional(),
});

export const createServiceSchema = z.object({
  name: z.string().min(1),
  category: z.enum(SERVICE_CATEGORIES),
  description: z.string().optional(),
  durationMinutes: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }),
  price: z.number().nonnegative(),
  currency: z.string().length(3).optional(),
  formats: z.array(z.enum(SESSION_FORMATS)).min(1),
  features: z.array(z.string()).optional(),
});

export const serviceIdParamsSchema = z.object({
  serviceId: z.string().uuid(),
});

export const availabilityQuerySchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
});
