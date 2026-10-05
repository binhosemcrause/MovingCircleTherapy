import type { ServiceCategory, SessionFormat } from '../../../shared/domain/enums';
import type { Service, ServiceSummary } from './Service';

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
  imageUrl?: string | null;
}

export interface UpdateServiceInput {
  name?: string;
  category?: ServiceCategory;
  description?: string;
  durationMinutes?: {
    min: number;
    max: number;
  };
  price?: number;
  currency?: string;
  formats?: SessionFormat[];
  features?: string[];
  imageUrl?: string | null;
}

export interface IServiceRepository {
  findAll(filter: ListServicesFilter): Promise<ServiceSummary[]>;
  findById(id: string): Promise<Service | null>;
  create(input: CreateServiceInput): Promise<Service>;
  update(id: string, input: UpdateServiceInput): Promise<Service | null>;
  delete(id: string): Promise<boolean>;
}
