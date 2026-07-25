export interface ErrorDetail {
  field?: string;
  issue: string;
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Invalid request payload', details?: ErrorDetail[]) {
    super(400, 'validation_error', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Missing or invalid authentication') {
    super(401, 'unauthorized', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'not_found', message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'conflict') {
    super(409, code, message);
  }
}
