import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnauthorizedException } from "./error-exceptions";

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
      throw new UnauthorizedException(
        "Provided refresh token is invalid or expired."
      );
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
      message: "Token Refreshed Successfully",
    });
  } catch (error) {
    next(error);
  }
};
