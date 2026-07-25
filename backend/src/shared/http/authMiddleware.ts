import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/AppError';
import type { TokenService } from '../security/TokenService';

export function createAuthMiddleware(tokenService: TokenService) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError();
    }

    const token = header.slice('Bearer '.length).trim();
    const payload = tokenService.verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  };
}
