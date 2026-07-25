import type { Pool } from 'pg';
import type { ResourceType } from '../../../shared/domain/enums';
import type { IResourceRepository, ListResourcesFilter } from '../domain/IResourceRepository';
import type { Resource } from '../domain/Resource';

interface ResourceRow {
  id: string;
  title: string;
  type: ResourceType;
  summary: string | null;
  url: string;
  published_at: Date;
}

function toResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    summary: row.summary,
    url: row.url,
    publishedAt: row.published_at,
  };
}

export class PgResourceRepository implements IResourceRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(filter: ListResourcesFilter): Promise<Resource[]> {
    const result = await this.pool.query<ResourceRow>(
      `select * from resources
       where ($1::resource_type is null or type = $1)
         and ($2::text is null or title ilike '%' || $2 || '%' or summary ilike '%' || $2 || '%')
       order by published_at desc`,
      [filter.type ?? null, filter.search ?? null],
    );
    return result.rows.map(toResource);
  }

  async findById(id: string): Promise<Resource | null> {
    const result = await this.pool.query<ResourceRow>('select * from resources where id = $1', [id]);
    return result.rows[0] ? toResource(result.rows[0]) : null;
  }
}
