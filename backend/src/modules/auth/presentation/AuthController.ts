import type { Request, Response } from 'express';
import type { LoginUserUseCase } from '../application/LoginUserUseCase';
import type { LogoutUserUseCase } from '../application/LogoutUserUseCase';
import type { RefreshTokenUseCase } from '../application/RefreshTokenUseCase';
import type { RegisterUserUseCase } from '../application/RegisterUserUseCase';

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.registerUserUseCase.execute(req.body);
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.loginUserUseCase.execute(req.body);
    res.status(200).json(result);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const result = await this.refreshTokenUseCase.execute(req.body);
    res.status(200).json(result);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    await this.logoutUserUseCase.execute({ userId: req.userId! });
    res.status(204).send();
  };
}
