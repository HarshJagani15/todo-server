import { Request, Response, NextFunction } from "express";
import { findUserByEmail } from "../../src/modules/auth/auth-repository";
import { retrieveGitHubUserEmail } from "../../utils/github-apis";
import { UnauthorizedException } from "../../utils/error-exceptions";

export const verifyGitHubToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
  token: string
): Promise<void> => {
  try {
    const email = await retrieveGitHubUserEmail(token).catch(() => {
      throw new UnauthorizedException(
        "Invalid or expired GitHub access token."
      );
    });
    req.user = { email };

    await findUserByEmail(email);
    next();
  } catch (error) {
    next(error);
  }
};
