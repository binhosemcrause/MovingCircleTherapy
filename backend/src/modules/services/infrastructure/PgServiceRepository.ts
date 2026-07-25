import type { Pool } from 'pg';
import type { ServiceCategory, SessionFormat } from '../../../shared/domain/enums';
import type { CreateServiceInput, IServiceRepository, ListServicesFilter } from '../domain/IServiceRepository';
import type { Service } from '../domain/Service';

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

  async findAll(filter: ListServicesFilter): Promise<Service[]> {
    const result = await this.pool.query<ServiceRow>(
      `${SELECT_SERVICE} where $1::service_category is null or s.category = $1 order by s.name`,
      [filter.category ?? null],
    );
    return result.rows.map(toService);
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
}
