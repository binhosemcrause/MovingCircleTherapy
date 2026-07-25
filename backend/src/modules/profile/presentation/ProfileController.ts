import type { Request, Response } from 'express';
import type { GetProfileUseCase } from '../application/GetProfileUseCase';
import type { UpdateProfileUseCase } from '../application/UpdateProfileUseCase';

export class ProfileController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const profile = await this.getProfileUseCase.execute(req.userId!);
    res.status(200).json(profile);
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const profile = await this.updateProfileUseCase.execute(req.userId!, req.body);
    res.status(200).json(profile);
  };
}
