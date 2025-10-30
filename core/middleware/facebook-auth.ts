import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../../utils/error-exceptions";
import { findUserByEmail } from "../../src/modules/auth/auth-repository";
import {
  retrieveFaceBookUserId,
  retrieveFaceBookUserInfo,
} from "../../utils/facebook-apis";
import { AUTH_EXCEPTION } from "../../utils/constants";

export const verifyFacebookToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
  token: string
): Promise<void> => {
  try {
    const { data } = await retrieveFaceBookUserId(token).catch(() => {
      throw new UnauthorizedException(
        "Invalid or expired Facebook access token."
      );
    });
    const userFaceBookId = data.user_id;

    const { email } = await retrieveFaceBookUserInfo(
      userFaceBookId,
      token
    ).catch(() => {
      throw new UnauthorizedException(
        "Invalid or expired Facebook access token."
      );
    });
    const loginUser = await findUserByEmail(email);

    const refreshTokenExpiry = loginUser.refresh_token_expiry!;

    const currentTime = Math.floor(Date.now() / 1000);
    const FIVE_DAYS_IN_SECONDS = 5 * 24 * 60 * 60;
    if (refreshTokenExpiry - currentTime < FIVE_DAYS_IN_SECONDS) {
      throw new UnauthorizedException(
        AUTH_EXCEPTION.UNAUTHORIZED.FACEBOOK_TOKEN,
        AUTH_EXCEPTION.UNAUTHORIZED.AUTH_TOKEN_CODE
      );
    }
    req.user = { email };
    next();
  } catch (error) {
    next(error);
  }
};
