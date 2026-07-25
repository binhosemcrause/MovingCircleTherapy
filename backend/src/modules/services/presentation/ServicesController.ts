import type { Request, Response } from 'express';
import type { ServiceCategory } from '../../../shared/domain/enums';
import type { CreateServiceInput } from '../domain/IServiceRepository';
import type { CreateServiceUseCase } from '../application/CreateServiceUseCase';
import type { GetServiceUseCase } from '../application/GetServiceUseCase';
import type { ListAvailabilityUseCase } from '../application/ListAvailabilityUseCase';
import type { ListServicesUseCase } from '../application/ListServicesUseCase';
import { toServiceResponse } from './serviceMapper';

export class ServicesController {
  constructor(
    private readonly listServicesUseCase: ListServicesUseCase,
    private readonly getServiceUseCase: GetServiceUseCase,
    private readonly listAvailabilityUseCase: ListAvailabilityUseCase,
    private readonly createServiceUseCase: CreateServiceUseCase,
  ) {}

  listServices = async (req: Request, res: Response): Promise<void> => {
    const services = await this.listServicesUseCase.execute(req.query as { category?: ServiceCategory });
    res.status(200).json(services.map(toServiceResponse));
  };

  getService = async (req: Request, res: Response): Promise<void> => {
    const { serviceId } = req.params as { serviceId: string };
    const service = await this.getServiceUseCase.execute(serviceId);
    res.status(200).json(toServiceResponse(service));
  };

  listAvailability = async (req: Request, res: Response): Promise<void> => {
    const { serviceId } = req.params as { serviceId: string };
    const { from, to } = req.query as { from?: string; to?: string };
    const slots = await this.listAvailabilityUseCase.execute({ serviceId, from, to });
    res.status(200).json(slots);
  };

  createService = async (req: Request, res: Response): Promise<void> => {
    const service = await this.createServiceUseCase.execute(req.body as CreateServiceInput);
    res.status(201).json(toServiceResponse(service));
  };
}
