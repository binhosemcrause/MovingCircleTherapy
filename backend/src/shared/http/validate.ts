import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { BadRequestError } from '../errors/AppError';

interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(targets: ValidationTargets) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const mutableReq = req as unknown as Record<keyof ValidationTargets, unknown>;
    for (const [key, schema] of Object.entries(targets) as Array<[keyof ValidationTargets, ZodSchema | undefined]>) {
      if (!schema) continue;
      const result = schema.safeParse(mutableReq[key]);
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          issue: issue.message,
        }));
        throw new BadRequestError('Invalid request payload', details);
      }
      mutableReq[key] = result.data;
    }
    next();
  };
}
