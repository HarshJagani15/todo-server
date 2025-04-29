import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnauthorizedException } from "./error-exceptions";
import { AUTH, AUTH_EXCEPTION } from "./constants";

export const refreshJwtAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let decoded;
    try {
      const { refreshToken } = req.body;
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!);
    } catch (error) {
      throw new UnauthorizedException(AUTH_EXCEPTION.UNAUTHORIZED.AUTH_TOKEN);
    }
    const { email } = decoded as JwtPayload;
    const accessToken = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });
    const refreshToken = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      message: AUTH.TOKEN.REFRESH,
    });
  } catch (error) {
    next(error);
  }
};
