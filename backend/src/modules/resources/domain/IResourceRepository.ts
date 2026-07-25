import type { ResourceType } from '../../../shared/domain/enums';
import type { Resource } from './Resource';

export interface ListResourcesFilter {
  type?: ResourceType;
  search?: string;
}

export interface IResourceRepository {
  findAll(filter: ListResourcesFilter): Promise<Resource[]>;
  findById(id: string): Promise<Resource | null>;
}
