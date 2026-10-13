import type { Pool } from 'pg';
import type { AppointmentStatus } from '../../../shared/domain/enums';
import type { ITherapistNotificationRepository } from '../domain/ITherapistNotificationRepository';
import type { PendingNotificationEmail, TherapistNotification } from '../domain/TherapistNotification';

const MAX_LISTED = 50;

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string;
  read_at: Date | null;
  created_at: Date;
  appointment_id: string | null;
  scheduled_at: Date | null;
  status: AppointmentStatus | null;
  service_name: string | null;
  client_name: string | null;
}

function toNotification(row: NotificationRow): TherapistNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at,
    appointment: row.appointment_id
      ? {
          id: row.appointment_id,
          scheduledAt: row.scheduled_at!,
          status: row.status!,
          serviceName: row.service_name!,
          clientName: row.client_name!,
        }
      : null,
  };
}

export class PgTherapistNotificationRepository implements ITherapistNotificationRepository {
  constructor(private readonly pool: Pool) {}

  async findByUser(userId: string): Promise<TherapistNotification[]> {
    const result = await this.pool.query<NotificationRow>(
      `select n.id, n.type, n.title, n.body, n.read_at, n.created_at,
              a.id as appointment_id, a.scheduled_at, a.status,
              s.name as service_name,
              c.first_name || ' ' || c.last_name as client_name
       from therapist_notifications n
       join therapists t on t.id = n.therapist_id
       left join appointments a on a.id = n.appointment_id
       left join services s on s.id = a.service_id
       left join users c on c.id = a.user_id
       where t.user_id = $1
       order by n.created_at desc
       limit $2`,
      [userId, MAX_LISTED],
    );
    return result.rows.map(toNotification);
  }

  async markAllReadByUser(userId: string): Promise<void> {
    await this.pool.query(
      `update therapist_notifications n set read_at = now()
       from therapists t
       where t.id = n.therapist_id and t.user_id = $1 and n.read_at is null`,
      [userId],
    );
  }

  async findUndeliveredByAppointment(appointmentId: string): Promise<PendingNotificationEmail[]> {
    const result = await this.pool.query<{
      id: string;
      title: string;
      body: string;
      first_name: string;
      email: string | null;
    }>(
      `select n.id, n.title, n.body, t.first_name, coalesce(u.email, t.email)::text as email
       from therapist_notifications n
       join therapists t on t.id = n.therapist_id
       left join users u on u.id = t.user_id
       where n.appointment_id = $1 and n.delivered_at is null`,
      [appointmentId],
    );
    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      therapistFirstName: row.first_name,
      email: row.email,
    }));
  }

  async markDelivered(id: string): Promise<void> {
    await this.pool.query('update therapist_notifications set delivered_at = now() where id = $1', [id]);
  }
}
