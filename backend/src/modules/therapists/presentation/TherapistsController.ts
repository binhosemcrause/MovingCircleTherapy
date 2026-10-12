import type { Request, Response } from 'express';
import type { CreateTherapistInput, UpdateTherapistInput } from '../domain/ITherapistRepository';
import type { CreateTherapistUseCase } from '../application/CreateTherapistUseCase';
import type { DeleteTherapistUseCase } from '../application/DeleteTherapistUseCase';
import type { GetTherapistUseCase } from '../application/GetTherapistUseCase';
import type { ListTherapistsUseCase } from '../application/ListTherapistsUseCase';
import type { UpdateTherapistUseCase } from '../application/UpdateTherapistUseCase';
import { toTherapistResponse } from './therapistMapper';

export class TherapistsController {
  constructor(
    private readonly listTherapistsUseCase: ListTherapistsUseCase,
    private readonly getTherapistUseCase: GetTherapistUseCase,
    private readonly createTherapistUseCase: CreateTherapistUseCase,
    private readonly updateTherapistUseCase: UpdateTherapistUseCase,
    private readonly deleteTherapistUseCase: DeleteTherapistUseCase,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const { includeInactive } = req.query as { includeInactive?: 'true' | 'false' };
    const therapists = await this.listTherapistsUseCase.execute({ includeInactive: includeInactive === 'true' });
    res.status(200).json(therapists.map(toTherapistResponse));
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const { therapistId } = req.params as { therapistId: string };
    const therapist = await this.getTherapistUseCase.execute(therapistId);
    res.status(200).json(toTherapistResponse(therapist));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const therapist = await this.createTherapistUseCase.execute(req.body as CreateTherapistInput);
    res.status(201).json(toTherapistResponse(therapist));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { therapistId } = req.params as { therapistId: string };
    const therapist = await this.updateTherapistUseCase.execute(therapistId, req.body as UpdateTherapistInput);
    res.status(200).json(toTherapistResponse(therapist));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { therapistId } = req.params as { therapistId: string };
    await this.deleteTherapistUseCase.execute(therapistId);
    res.status(204).send();
  };
}
