import type { Service } from '../domain/Service';

export function toServiceResponse(service: Service) {
  return {
    id: service.id,
    name: service.name,
    category: service.category,
    description: service.description,
    durationMinutes: service.durationMinutes,
    price: service.price,
    currency: service.currency,
    formats: service.formats,
    features: service.features,
  };
}
