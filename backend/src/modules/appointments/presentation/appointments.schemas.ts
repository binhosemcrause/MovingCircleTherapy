import { z } from 'zod';
import { APPOINTMENT_STATUSES, SESSION_FORMATS } from '../../../shared/domain/enums';

export const listAppointmentsQuerySchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES).optional(),
});

export const appointmentIdParamsSchema = z.object({
  appointmentId: z.string().uuid(),
});

export const bookAppointmentSchema = z.object({
  serviceId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  format: z.enum(SESSION_FORMATS).optional(),
  notes: z.string().optional(),
});

export const rescheduleAppointmentSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});
