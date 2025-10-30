import { refreshFacebookToken } from "./refresh-facebook-auth-token";
import { refreshGitHubToken } from "./refresh-github-auth-token";
import { refreshJwtAuthToken } from "./refresh-jwt-auth-token";
import { NextFunction, Request, Response } from "express";

export const checkLoginType = (
  req: Request,
  res: Response,
  next: NextFunction,
  accessToken: string
) => {
  if (accessToken?.startsWith("EAA")) {
    return refreshFacebookToken(req, res, next);
  } else if (/^gh[p|o]_[A-Za-z0-9]+$/.test(accessToken!)) {
    return refreshGitHubToken(req, res);
  } else {
    return refreshJwtAuthToken(req, res, next);
  }
};
