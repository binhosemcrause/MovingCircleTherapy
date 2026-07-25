import type { ResourceType } from '../../../shared/domain/enums';

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  summary: string | null;
  url: string;
  publishedAt: Date;
}
