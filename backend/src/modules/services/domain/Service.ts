import type { ServiceCategory, SessionFormat } from '../../../shared/domain/enums';

export interface ServiceSummary {
  id: string;
  name: string;
  category: ServiceCategory;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMinutes: {
    min: number;
    max: number;
  };
  price: number;
  currency: string;
  formats: SessionFormat[];
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}
