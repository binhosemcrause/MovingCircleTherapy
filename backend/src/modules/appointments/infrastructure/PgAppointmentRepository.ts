import type { Pool } from 'pg';
import type { AppointmentStatus, SessionFormat } from '../../../shared/domain/enums';
import { queryOpenSlots } from '../../services/infrastructure/PgAvailabilityRepository';
import type { Appointment, AssignedAppointment } from '../domain/Appointment';
import type {
  BookingResult,
  CreateAppointmentInput,
  IAppointmentRepository,
  UpdateAppointmentInput,
} from '../domain/IAppointmentRepository';

interface AppointmentRow {
  id: string;
  user_id: string;
  service_id: string;
  therapist_id: string | null;
  scheduled_at: Date;
  format: SessionFormat;
  status: AppointmentStatus;
  notes: string | null;
  cancelled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function toAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    userId: row.user_id,
    serviceId: row.service_id,
    therapistId: row.therapist_id,
    scheduledAt: row.scheduled_at,
    format: row.format,
    status: row.status,
    notes: row.notes,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const UNIQUE_VIOLATION = '23505';
const THERAPIST_SLOT_CONSTRAINT = 'appointments_therapist_scheduled_key';

function isTherapistDoubleBooking(error: unknown): boolean {
  const pgError = error as { code?: string; constraint?: string };
  return pgError.code === UNIQUE_VIOLATION && pgError.constraint === THERAPIST_SLOT_CONSTRAINT;
}

export class PgAppointmentRepository implements IAppointmentRepository {
  constructor(private readonly pool: Pool) {}

  async findByUser(userId: string, status?: AppointmentStatus): Promise<Appointment[]> {
    const result = await this.pool.query<AppointmentRow>(
      `select * from appointments
       where user_id = $1 and ($2::appointment_status is null or status = $2)
       order by scheduled_at desc`,
      [userId, status ?? null],
    );
    return result.rows.map(toAppointment);
  }

  async findByTherapistUser(userId: string): Promise<AssignedAppointment[]> {
    const result = await this.pool.query<AppointmentRow & { client_name: string }>(
      `select a.*, c.first_name || ' ' || c.last_name as client_name
       from appointments a
       join therapists t on t.id = a.therapist_id
       join users c on c.id = a.user_id
       where t.user_id = $1
       order by a.scheduled_at`,
      [userId],
    );
    return result.rows.map((row) => ({ ...toAppointment(row), clientName: row.client_name }));
  }

  async findById(id: string): Promise<Appointment | null> {
    const result = await this.pool.query<AppointmentRow>('select * from appointments where id = $1', [id]);
    return result.rows[0] ? toAppointment(result.rows[0]) : null;
  }

  async update(id: string, input: UpdateAppointmentInput): Promise<Appointment> {
    const result = await this.pool.query<AppointmentRow>(
      `update appointments
       set scheduled_at = coalesce($2, scheduled_at),
           notes = coalesce($3, notes),
           status = coalesce($4, status),
           cancelled_at = case when $5::boolean then $6 else cancelled_at end
       where id = $1
       returning *`,
      [
        id,
        input.scheduledAt ?? null,
        input.notes ?? null,
        input.status ?? null,
        input.cancelledAt !== undefined,
        input.cancelledAt ?? null,
      ],
    );
    return toAppointment(result.rows[0]!);
  }

  async book(input: CreateAppointmentInput): Promise<BookingResult> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');

      // Serialises bookings per therapist, so two overlapping requests can't
      // both pass the open-slot check below.
      await client.query('select pg_advisory_xact_lock(hashtextextended($1, 0))', [input.therapistId]);

      const open = await queryOpenSlots(client, {
        serviceId: input.serviceId,
        at: input.scheduledAt,
        therapistId: input.therapistId,
      });
      if (open.length === 0) {
        await client.query('rollback');
        return { conflict: 'therapist_unavailable' };
      }

      const inserted = await client.query<AppointmentRow>(
        `insert into appointments (user_id, service_id, therapist_id, scheduled_at, format, notes)
         values ($1, $2, $3, $4, $5, $6)
         returning *`,
        [input.userId, input.serviceId, input.therapistId, input.scheduledAt, input.format, input.notes ?? null],
      );
      const appointment = toAppointment(inserted.rows[0]!);

      await client.query(
        `insert into therapist_notifications (therapist_id, appointment_id, type, title, body)
         values ($1, $2, 'appointment_booked', $3, $4)`,
        [input.therapistId, appointment.id, input.therapistNotification.title, input.therapistNotification.body],
      );

      await client.query('commit');
      return { appointment };
    } catch (error) {
      await client.query('rollback');
      if (isTherapistDoubleBooking(error)) {
        return { conflict: 'therapist_unavailable' };
      }
      throw error;
    } finally {
      client.release();
    }
  }
}
