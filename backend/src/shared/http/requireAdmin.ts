import type { NextFunction, Request, Response } from 'express';
import type { IUserRepository } from '../../modules/users/domain/IUserRepository';
import { ForbiddenError } from '../errors/AppError';
import { asyncHandler } from './asyncHandler';

// Runs after the auth middleware. The role is read from the database on each
// request rather than from the token, so removing someone's admin role takes
// effect immediately.
export function createRequireAdmin(userRepository: IUserRepository) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const user = req.userId ? await userRepository.findById(req.userId) : null;
    if (user?.role !== 'admin') {
      throw new ForbiddenError('Only an admin can do this.');
    }
    next();
  });
}
