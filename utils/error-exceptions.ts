import { DEFAULT_EXCEPTION } from "./constants";

export class CustomError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational = true,
    code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this);
  }
}

export class BadRequestException extends CustomError {
  constructor(message = DEFAULT_EXCEPTION.BAD_REQUEST) {
    super(message, 400);
  }
}

export class UnauthorizedException extends CustomError {
  constructor(
    message = DEFAULT_EXCEPTION.UNAUTHORIZED,
    code = DEFAULT_EXCEPTION.UNAUTHORIZED_CODE
  ) {
    super(message, 401);
    this.code = code;
  }
}

export class ForbiddenException extends CustomError {
  constructor(message = DEFAULT_EXCEPTION.FORBIDDEN) {
    super(message, 403);
  }
}

export class NotFoundException extends CustomError {
  constructor(message = DEFAULT_EXCEPTION.NOT_FOUND) {
    super(message, 404);
  }
}

export class ConflictException extends CustomError {
  constructor(message = DEFAULT_EXCEPTION.CONFLICT) {
    super(message, 409);
  }
}

export class InternalErrorException extends CustomError {
  constructor(message = DEFAULT_EXCEPTION.INTERNAL_SERVER) {
    super(message, 500);
  }
}
