import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../../utils/error-exceptions";
import { findUserByEmail } from "../../src/modules/auth/auth-repository";

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
        "Provided access token is invalid or expired.",
        "AUTH_TOKEN_EXPIRED"
      );
    }
    const email = req.user.email;
    await findUserByEmail(email);
    next();
  } catch (error) {
    next(error);
  }
};
