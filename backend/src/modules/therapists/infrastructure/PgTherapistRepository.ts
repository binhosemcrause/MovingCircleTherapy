import type { Pool } from 'pg';
import type { CreateTherapistInput, ITherapistRepository, UpdateTherapistInput } from '../domain/ITherapistRepository';
import type { Therapist } from '../domain/Therapist';

interface TherapistRow {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  bio: string;
  specialties: string[];
  photo_url: string | null;
  user_id: string | null;
  is_active: boolean;
  position: number;
}

function toTherapist(row: TherapistRow): Therapist {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    title: row.title,
    bio: row.bio,
    specialties: row.specialties,
    photoUrl: row.photo_url,
    userId: row.user_id,
    isActive: row.is_active,
    position: row.position,
  };
}

function slugify(firstName: string, lastName: string): string {
  const slug = `${firstName} ${lastName}`
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'therapist';
}

export class PgTherapistRepository implements ITherapistRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(options: { includeInactive: boolean }): Promise<Therapist[]> {
    const result = await this.pool.query<TherapistRow>(
      'select * from therapists where ($1::boolean or is_active) order by position, last_name, first_name',
      [options.includeInactive],
    );
    return result.rows.map(toTherapist);
  }

  async findById(id: string): Promise<Therapist | null> {
    const result = await this.pool.query<TherapistRow>('select * from therapists where id = $1', [id]);
    return result.rows[0] ? toTherapist(result.rows[0]) : null;
  }

  async create(input: CreateTherapistInput): Promise<Therapist> {
    const base = slugify(input.firstName, input.lastName);
    // Two therapists can share a name, so a taken slug gets a numeric
    // suffix. New therapists default to the end of the list.
    const result = await this.pool.query<TherapistRow>(
      `insert into therapists
         (slug, first_name, last_name, title, bio, specialties, photo_url, email, is_active, position)
       values (
         $1 || case when exists (select 1 from therapists where slug = $1)
                    then '-' || (select count(*) + 1 from therapists where slug like $1 || '%')
                    else '' end,
         $2, $3, $4, $5, $6, $7, $8, $9,
         coalesce($10, (select coalesce(max(position), 0) + 1 from therapists))
       )
       returning *`,
      [
        base,
        input.firstName,
        input.lastName,
        input.title,
        input.bio ?? '',
        input.specialties ?? [],
        input.photoUrl ?? null,
        input.email ?? null,
        input.isActive ?? true,
        input.position ?? null,
      ],
    );
    return toTherapist(result.rows[0]!);
  }

  async update(id: string, input: UpdateTherapistInput): Promise<Therapist | null> {
    const result = await this.pool.query<TherapistRow>(
      `update therapists set
         first_name = coalesce($2, first_name),
         last_name = coalesce($3, last_name),
         title = coalesce($4, title),
         bio = coalesce($5, bio),
         specialties = coalesce($6, specialties),
         photo_url = coalesce($7, photo_url),
         email = coalesce($8, email),
         is_active = coalesce($9, is_active),
         position = coalesce($10, position)
       where id = $1
       returning *`,
      [
        id,
        input.firstName ?? null,
        input.lastName ?? null,
        input.title ?? null,
        input.bio ?? null,
        input.specialties ?? null,
        input.photoUrl ?? null,
        input.email ?? null,
        input.isActive ?? null,
        input.position ?? null,
      ],
    );
    return result.rows[0] ? toTherapist(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query('delete from therapists where id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async hasUpcomingAppointments(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `select 1 from appointments
       where therapist_id = $1 and status in ('pending', 'confirmed') and scheduled_at > now()
       limit 1`,
      [id],
    );
    return result.rows.length > 0;
  }

  async linkUser(id: string, userId: string, email: string): Promise<void> {
    await this.pool.query('update therapists set user_id = $2, email = $3 where id = $1', [id, userId, email]);
  }
}
