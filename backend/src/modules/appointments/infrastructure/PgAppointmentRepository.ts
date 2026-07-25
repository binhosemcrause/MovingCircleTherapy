import type { Pool } from 'pg';
import type { AppointmentStatus, SessionFormat } from '../../../shared/domain/enums';
import type { Appointment } from '../domain/Appointment';
import type {
  CreateAppointmentInput,
  IAppointmentRepository,
  UpdateAppointmentInput,
} from '../domain/IAppointmentRepository';

interface AppointmentRow {
  id: string;
  user_id: string;
  service_id: string;
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
    scheduledAt: row.scheduled_at,
    format: row.format,
    status: row.status,
    notes: row.notes,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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

  async bookWithSlot(slotId: string, input: CreateAppointmentInput): Promise<Appointment | null> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');

      const reserved = await client.query('update availability_slots set is_booked = true where id = $1 and is_booked = false returning id', [
        slotId,
      ]);
      if (reserved.rowCount === 0) {
        await client.query('rollback');
        return null;
      }

      const inserted = await client.query<AppointmentRow>(
        `insert into appointments (user_id, service_id, scheduled_at, format, notes)
         values ($1, $2, $3, $4, $5)
         returning *`,
        [input.userId, input.serviceId, input.scheduledAt, input.format, input.notes ?? null],
      );
      const appointment = toAppointment(inserted.rows[0]!);

      await client.query('update availability_slots set appointment_id = $2 where id = $1', [slotId, appointment.id]);

      await client.query('commit');
      return appointment;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }
}
