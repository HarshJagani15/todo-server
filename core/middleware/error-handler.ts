import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../utils/error-exceptions";
import { DEFAULT_EXCEPTION } from "../../utils/constants";

const globalErrorHandler: (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void = (err, _req, res, _next) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  return res.status(500).json({
    success: false,
    message: DEFAULT_EXCEPTION.INTERNAL_SERVER,
  });
};

export default globalErrorHandler;
