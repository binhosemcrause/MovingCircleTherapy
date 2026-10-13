import type { Pool } from 'pg';
import type { CreateUserInput, IUserRepository, UpdateUserInput } from '../domain/IUserRepository';
import type { UserRole } from '../../../shared/domain/enums';
import type { User } from '../domain/User';

interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone: string | null;
  location: string | null;
  tagline: string | null;
  avatar_url: string | null;
  role: UserRole;
  therapist_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone,
    location: row.location,
    tagline: row.tagline,
    avatarUrl: row.avatar_url,
    role: row.role,
    therapistId: row.therapist_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const USER_COLUMNS = 'u.*, (select t.id from therapists t where t.user_id = u.id) as therapist_id';

export class PgUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(`select ${USER_COLUMNS} from users u where u.id = $1`, [id]);
    return result.rows[0] ? toUser(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(`select ${USER_COLUMNS} from users u where u.email = $1`, [
      email,
    ]);
    return result.rows[0] ? toUser(result.rows[0]) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const result = await this.pool.query<UserRow>(
      `insert into users (first_name, last_name, email, password_hash, phone, role)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [input.firstName, input.lastName, input.email, input.passwordHash, input.phone ?? null, input.role ?? 'client'],
    );
    return toUser(result.rows[0]!);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const result = await this.pool.query<UserRow>(
      `with u as (
         update users
         set first_name = coalesce($2, first_name),
             last_name = coalesce($3, last_name),
             phone = coalesce($4, phone),
             location = coalesce($5, location),
             tagline = coalesce($6, tagline),
             avatar_url = coalesce($7, avatar_url)
         where id = $1
         returning *
       )
       select ${USER_COLUMNS} from u`,
      [
        id,
        input.firstName ?? null,
        input.lastName ?? null,
        input.phone ?? null,
        input.location ?? null,
        input.tagline ?? null,
        input.avatarUrl ?? null,
      ],
    );
    return toUser(result.rows[0]!);
  }

  async setRole(id: string, role: UserRole): Promise<void> {
    await this.pool.query('update users set role = $2 where id = $1', [id, role]);
  }
}
