import { NextFunction, Request, Response } from "express";
import { findUserByEmail } from "../src/modules/auth/auth-repository";
import {
  retrieveFaceBookLongLivedToken,
  retrieveFaceBookUserId,
  retrieveFaceBookUserInfo,
} from "./facebook-apis";
import { UnauthorizedException } from "./error-exceptions";

export const refreshFacebookToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { accessToken } = req.body;

  try {
    const { data } = await retrieveFaceBookUserId(accessToken);
    if (!data.is_valid) {
      throw new UnauthorizedException(
        "Provided access token is invalid or expired."
      );
    }
    const userFaceBookId = data.user_id;
    const { email } = await retrieveFaceBookUserInfo(
      userFaceBookId,
      accessToken
    );
    const longLivedTokenData = await retrieveFaceBookLongLivedToken(
      accessToken
    );
    const longLivedToken = longLivedTokenData.access_token;
    const expiresIn = longLivedTokenData.expires_in;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
    const loginUser = await findUserByEmail(email);

    loginUser.refresh_token = longLivedToken;
    loginUser.refresh_token_expiry = expiresAt;
    await loginUser.save();

    res.status(201).json({
      success: true,
      accessToken: longLivedToken,
      message: "Token Refreshed Successfully",
    });
  } catch (error) {
    next(error);
  }
};
