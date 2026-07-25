import { z } from 'zod';
import { RESOURCE_TYPES } from '../../../shared/domain/enums';

export const listResourcesQuerySchema = z.object({
  type: z.enum(RESOURCE_TYPES).optional(),
  search: z.string().optional(),
});

export const resourceIdParamsSchema = z.object({
  resourceId: z.string().uuid(),
});
