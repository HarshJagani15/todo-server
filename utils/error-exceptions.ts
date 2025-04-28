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
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedException extends CustomError {
  constructor(message = "Unauthorized", code = "AUTH_INVALID_CREDENTIALS") {
    super(message, 401);
    this.code = code;
  }
}

export class ForbiddenException extends CustomError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundException extends CustomError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

export class ConflictException extends CustomError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

export class InternalErrorException extends CustomError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}
