import type { ServiceCategory, SessionFormat } from '../../../shared/domain/enums';
import type { Service } from './Service';

export interface ListServicesFilter {
  category?: ServiceCategory;
}

export interface CreateServiceInput {
  name: string;
  category: ServiceCategory;
  description?: string;
  durationMinutes: {
    min: number;
    max: number;
  };
  price: number;
  currency?: string;
  formats: SessionFormat[];
  features?: string[];
}

export interface IServiceRepository {
  findAll(filter: ListServicesFilter): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  create(input: CreateServiceInput): Promise<Service>;
}
