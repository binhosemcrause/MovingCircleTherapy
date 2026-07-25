import type { Pool } from 'pg';
import type { AvailabilityDateRange, IAvailabilityRepository } from '../domain/IAvailabilityRepository';
import type { AvailabilitySlot } from '../domain/AvailabilitySlot';

interface AvailabilitySlotRow {
  id: string;
  service_id: string;
  starts_at: Date;
  ends_at: Date;
  is_booked: boolean;
  appointment_id: string | null;
}

function toSlot(row: AvailabilitySlotRow): AvailabilitySlot {
  return {
    id: row.id,
    serviceId: row.service_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isBooked: row.is_booked,
    appointmentId: row.appointment_id,
  };
}

export class PgAvailabilityRepository implements IAvailabilityRepository {
  constructor(private readonly pool: Pool) {}

  async findByService(serviceId: string, range: AvailabilityDateRange): Promise<AvailabilitySlot[]> {
    const result = await this.pool.query<AvailabilitySlotRow>(
      `select * from availability_slots
       where service_id = $1
         and ($2::timestamptz is null or starts_at >= $2)
         and ($3::timestamptz is null or starts_at <= $3)
       order by starts_at`,
      [serviceId, range.from ?? null, range.to ?? null],
    );
    return result.rows.map(toSlot);
  }

  async findOpenSlot(serviceId: string, startsAt: Date): Promise<AvailabilitySlot | null> {
    const result = await this.pool.query<AvailabilitySlotRow>(
      `select * from availability_slots
       where service_id = $1 and starts_at = $2 and is_booked = false`,
      [serviceId, startsAt],
    );
    return result.rows[0] ? toSlot(result.rows[0]) : null;
  }

  async findById(id: string): Promise<AvailabilitySlot | null> {
    const result = await this.pool.query<AvailabilitySlotRow>('select * from availability_slots where id = $1', [id]);
    return result.rows[0] ? toSlot(result.rows[0]) : null;
  }

  async findByAppointmentId(appointmentId: string): Promise<AvailabilitySlot | null> {
    const result = await this.pool.query<AvailabilitySlotRow>(
      'select * from availability_slots where appointment_id = $1',
      [appointmentId],
    );
    return result.rows[0] ? toSlot(result.rows[0]) : null;
  }

  async markBooked(id: string, appointmentId: string): Promise<void> {
    await this.pool.query(
      'update availability_slots set is_booked = true, appointment_id = $2 where id = $1',
      [id, appointmentId],
    );
  }

  async release(id: string): Promise<void> {
    await this.pool.query(
      'update availability_slots set is_booked = false, appointment_id = null where id = $1',
      [id],
    );
  }
}
