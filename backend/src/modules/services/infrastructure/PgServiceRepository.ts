import type { Pool } from 'pg';
import type { ServiceCategory, SessionFormat } from '../../../shared/domain/enums';
import { ConflictError } from '../../../shared/errors/AppError';
import type {
  CreateServiceInput,
  IServiceRepository,
  ListServicesFilter,
  UpdateServiceInput,
} from '../domain/IServiceRepository';
import type { Service, ServiceSummary } from '../domain/Service';

const FOREIGN_KEY_VIOLATION = '23503';

interface ServiceSummaryRow {
  id: string;
  name: string;
  category: ServiceCategory;
}

interface ServiceRow {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  duration_min_minutes: number;
  duration_max_minutes: number;
  price: string;
  currency: string;
  formats: SessionFormat[];
  features: string[];
  created_at: Date;
  updated_at: Date;
}

const SELECT_SERVICE = `
  select
    s.id, s.name, s.category, s.description,
    s.duration_min_minutes, s.duration_max_minutes,
    s.price, s.currency, s.created_at, s.updated_at,
    coalesce((
      select array_agg(sf.format::text order by sf.format)
      from service_formats sf where sf.service_id = s.id
    ), '{}') as formats,
    coalesce((
      select array_agg(feat.feature order by feat.position)
      from service_features feat where feat.service_id = s.id
    ), '{}') as features
  from services s
`;

function toServiceSummary(row: ServiceSummaryRow): ServiceSummary {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
  };
}

function toService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    durationMinutes: { min: row.duration_min_minutes, max: row.duration_max_minutes },
    price: Number.parseFloat(row.price),
    currency: row.currency,
    formats: row.formats,
    features: row.features,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PgServiceRepository implements IServiceRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(filter: ListServicesFilter): Promise<ServiceSummary[]> {
    const result = await this.pool.query<ServiceSummaryRow>(
      `select id, name, category from services
       where $1::service_category is null or category = $1
       order by name`,
      [filter.category ?? null],
    );
    return result.rows.map(toServiceSummary);
  }

  async findById(id: string): Promise<Service | null> {
    const result = await this.pool.query<ServiceRow>(`${SELECT_SERVICE} where s.id = $1`, [id]);
    return result.rows[0] ? toService(result.rows[0]) : null;
  }

  async create(input: CreateServiceInput): Promise<Service> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');

      const inserted = await client.query<{ id: string }>(
        `insert into services (name, category, description, duration_min_minutes, duration_max_minutes, price, currency)
         values ($1, $2, $3, $4, $5, $6, coalesce($7, 'USD'))
         returning id`,
        [
          input.name,
          input.category,
          input.description ?? '',
          input.durationMinutes.min,
          input.durationMinutes.max,
          input.price,
          input.currency ?? null,
        ],
      );
      const serviceId = inserted.rows[0]!.id;

      for (const format of input.formats) {
        await client.query(`insert into service_formats (service_id, format) values ($1, $2)`, [serviceId, format]);
      }

      const features = input.features ?? [];
      for (const [position, feature] of features.entries()) {
        await client.query(
          `insert into service_features (service_id, feature, position) values ($1, $2, $3)`,
          [serviceId, feature, position],
        );
      }

      await client.query('commit');

      const result = await client.query<ServiceRow>(`${SELECT_SERVICE} where s.id = $1`, [serviceId]);
      return toService(result.rows[0]!);
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id: string, input: UpdateServiceInput): Promise<Service | null> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');

      const updated = await client.query<{ id: string }>(
        `update services set
           name = coalesce($2, name),
           category = coalesce($3, category),
           description = coalesce($4, description),
           duration_min_minutes = coalesce($5, duration_min_minutes),
           duration_max_minutes = coalesce($6, duration_max_minutes),
           price = coalesce($7, price),
           currency = coalesce($8, currency)
         where id = $1
         returning id`,
        [
          id,
          input.name ?? null,
          input.category ?? null,
          input.description ?? null,
          input.durationMinutes?.min ?? null,
          input.durationMinutes?.max ?? null,
          input.price ?? null,
          input.currency ?? null,
        ],
      );

      if (updated.rows.length === 0) {
        await client.query('rollback');
        return null;
      }

      if (input.formats) {
        await client.query(`delete from service_formats where service_id = $1`, [id]);
        for (const format of input.formats) {
          await client.query(`insert into service_formats (service_id, format) values ($1, $2)`, [id, format]);
        }
      }

      if (input.features) {
        await client.query(`delete from service_features where service_id = $1`, [id]);
        for (const [position, feature] of input.features.entries()) {
          await client.query(
            `insert into service_features (service_id, feature, position) values ($1, $2, $3)`,
            [id, feature, position],
          );
        }
      }

      await client.query('commit');

      const result = await client.query<ServiceRow>(`${SELECT_SERVICE} where s.id = $1`, [id]);
      return toService(result.rows[0]!);
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(`delete from services where id = $1`, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictError(
          'Cannot delete a service that has existing appointments.',
          'service_has_appointments',
        );
      }
      throw error;
    }
  }
}

function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}
