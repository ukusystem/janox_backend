export interface CustomErrorProps {
  // readonly isOperational: boolean;
  readonly statusCode: number;
  readonly errorType: string;
}

export class CustomError extends Error implements CustomErrorProps {
  // readonly isOperational: boolean;
  readonly statusCode: number;
  readonly errorType: string;

  constructor(
    message: string,
    statusCode: number,
    errorType: string
    // isOperational: boolean
  ) {
    super(message);
    // this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorType = errorType;
    // this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
