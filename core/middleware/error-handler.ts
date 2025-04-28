import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../utils/error-exceptions";

const globalErrorHandler: (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => void = (err, _req, res, _next) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code ?? "INTERNAL_ERROR",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};

export default globalErrorHandler;
