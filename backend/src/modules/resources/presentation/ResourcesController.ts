import type { Request, Response } from 'express';
import type { ResourceType } from '../../../shared/domain/enums';
import type { GetResourceUseCase } from '../application/GetResourceUseCase';
import type { ListResourcesUseCase } from '../application/ListResourcesUseCase';
import { toResourceResponse } from './resourceMapper';

export class ResourcesController {
  constructor(
    private readonly listResourcesUseCase: ListResourcesUseCase,
    private readonly getResourceUseCase: GetResourceUseCase,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const { type, search } = req.query as { type?: ResourceType; search?: string };
    const resources = await this.listResourcesUseCase.execute({ type, search });
    res.status(200).json(resources.map(toResourceResponse));
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const { resourceId } = req.params as { resourceId: string };
    const resource = await this.getResourceUseCase.execute(resourceId);
    res.status(200).json(toResourceResponse(resource));
  };
}
