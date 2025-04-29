import type { NextFunction, Request, Response } from "express";
import { verifyFacebookToken } from "../core/middleware/facebook-auth";
import { verifyGitHubToken } from "../core/middleware/github-auth";
import { verifyJwtToken } from "../core/middleware/jwt-auth";
import { NotFoundException } from "./error-exceptions";
import { AUTH_EXCEPTION } from "./constants";

export const excludeAuthPaths = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const excludedPaths: string[] = [
    "/api/v1/auth/signin",
    "/api/v1/auth/signup",
    "/api/v1/auth/refresh-token",
  ];
  if (excludedPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new NotFoundException(AUTH_EXCEPTION.NOTFOUND.TOKEN);
  }
  if (token?.startsWith("EAA")) {
    return verifyFacebookToken(req, res, next, token);
  } else if (/^gh[p|o]_[A-Za-z0-9]+$/.test(token!)) {
    return verifyGitHubToken(req, res, next, token);
  }
  return verifyJwtToken(req, res, next, token);
};
