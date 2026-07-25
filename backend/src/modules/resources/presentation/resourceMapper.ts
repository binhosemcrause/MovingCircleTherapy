import type { Resource } from '../domain/Resource';

export function toResourceResponse(resource: Resource) {
  return {
    id: resource.id,
    title: resource.title,
    type: resource.type,
    summary: resource.summary,
    url: resource.url,
    publishedAt: resource.publishedAt.toISOString(),
  };
}
