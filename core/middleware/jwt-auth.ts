import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../../utils/error-exceptions";
import { findUserByEmail } from "../../src/modules/auth/auth-repository";
import { AUTH_EXCEPTION } from "../../utils/constants";

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export const verifyJwtToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
  token: string
): Promise<void> => {
  try {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = decoded;
    } catch (error) {
      throw new UnauthorizedException(
        AUTH_EXCEPTION.UNAUTHORIZED.AUTH_TOKEN,
        AUTH_EXCEPTION.UNAUTHORIZED.AUTH_TOKEN_CODE
      );
    }
    const email = req.user.email;
    await findUserByEmail(email);
    next();
  } catch (error) {
    next(error);
  }
};
