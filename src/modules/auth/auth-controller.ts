import { NextFunction, Request, Response } from "express";
import { IUserDocument } from "../../../models/user-model";
import {
  addNewFacebookUser,
  addNewUser,
  checkAlreadyRegistered,
  findUserByEmail,
  saveTokenInfoInDB,
} from "./auth-repository";
import {
  comparePassword,
  generateRefreshToken,
  generateToken,
  passwordEncryption,
} from "./auth-services";
import { checkLoginType } from "../../../utils/login-type";
import {
  ConflictException,
  InternalErrorException,
  UnauthorizedException,
} from "../../../utils/error-exceptions";
import {
  retrieveFaceBookLongLivedToken,
  retrieveFaceBookUserId,
  retrieveFaceBookUserInfo,
} from "../../../utils/facebook-apis";
import {
  retrieveGitHubAccessToken,
  retrieveGitHubUserEmail,
  retrieveGitHubUserInfo,
} from "../../../utils/github-apis";
import { AUTH_EXCEPTION, AUTH } from "../../../utils/constants";

export const signInController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (user.login_type === "email") {
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException(
         AUTH_EXCEPTION.UNAUTHORIZED.CREDENTIALS
        );
      } else {
        const token = generateToken(email);
        const refreshToken = generateRefreshToken(email);

        res.status(200).json({
          success: true,
          token,
          refreshToken,
          message: AUTH.LOGIN.EMAIL,
        });
      }
    } else {
      throw new ConflictException(AUTH_EXCEPTION.CONFLICT.EMAIL);
    }
  } catch (error) {
    next(error);
  }
};

export const signUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userName, email, password, loginType } = req.body;
    const isUserRegistered = await checkAlreadyRegistered(email);

    if (isUserRegistered) {
      throw new ConflictException(AUTH_EXCEPTION.CONFLICT.EMAIL);
    }
    const encryptedPassword = await passwordEncryption(password);

    await addNewUser({
      name: userName,
      email,
      password: encryptedPassword,
      profile_picture: "",
      login_type: loginType,
    });
    res.status(201).json({
      success: true,
      message: AUTH.REGISTER.EMAIL,
    });
  } catch (error) {
    next(error);
  }
};

export const githubSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { code: tokenGenerationCode } = req.body;

  try {
    const accessToken = await retrieveGitHubAccessToken(tokenGenerationCode);

    if (!accessToken) {
      throw new InternalErrorException(
        AUTH_EXCEPTION.INTERNAL_SERVER.FAILED_TO_RETRIVE_GITHUB_TOKEN
      );
    }

    const email = await retrieveGitHubUserEmail(accessToken);

    const loginUser: IUserDocument | null = await findUserByEmail(email);

    if (loginUser.login_type === "github") {
      res.status(200).json({
        success: true,
        token: accessToken,
        message: AUTH.LOGIN.GITHUB,
      });
    } else {
      throw new ConflictException(AUTH_EXCEPTION.CONFLICT.EMAIL);
    }
  } catch (error) {
    next(error);
  }
};

export const githubSignUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { code: tokenGenerationCode, loginType } = req.body;

  try {
    const accessToken = await retrieveGitHubAccessToken(tokenGenerationCode);

    if (!accessToken) {
      throw new InternalErrorException(
        AUTH_EXCEPTION.INTERNAL_SERVER.FAILED_TO_RETRIVE_GITHUB_TOKEN
      );
    }
    const { login: name, avatar_url: profile_picture } =
      await retrieveGitHubUserInfo(accessToken);

    const email = await retrieveGitHubUserEmail(accessToken);

    const isUserRegistered = await checkAlreadyRegistered(email);

    if (isUserRegistered) {
      throw new ConflictException(AUTH_EXCEPTION.CONFLICT.EMAIL);
    }

    await addNewUser({
      name,
      email,
      password: "",
      profile_picture,
      login_type: loginType,
    });

    res.status(201).json({
      success: true,
      token: accessToken,
      message: AUTH.REGISTER.GITHUB,
    });
  } catch (error) {
    next(error);
  }
};

export const facebookSignInController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { accessToken } = req.body;
    const { data } = await retrieveFaceBookUserId(accessToken);
    if (!data.is_valid) {
      throw new UnauthorizedException(
       AUTH_EXCEPTION.UNAUTHORIZED.FACEBOOK_TOKEN
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

    const loginUser: IUserDocument | null = await findUserByEmail(email);

    if (loginUser?.login_type !== "facebook") {
      throw new ConflictException(AUTH_EXCEPTION.CONFLICT.EMAIL);
    } else {
      await saveTokenInfoInDB({ loginUser, longLivedToken, expiresAt });

      res.status(200).json({
        success: true,
        token: longLivedToken,
        message: AUTH.LOGIN.FACEBOOK,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const facebookSignUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { accessToken, loginType } = req.body;
    const { data } = await retrieveFaceBookUserId(accessToken);
    if (!data.is_valid) {
      throw new UnauthorizedException(
       AUTH_EXCEPTION.UNAUTHORIZED.FACEBOOK_TOKEN
      );
    }
    const userFaceBookId = data.user_id;

    const { name, email, picture } = await retrieveFaceBookUserInfo(
      userFaceBookId,
      accessToken
    );

    const longLivedTokenData = await retrieveFaceBookLongLivedToken(
      accessToken
    );

    const longLivedToken = longLivedTokenData.access_token;
    const expiresIn = longLivedTokenData.expires_in;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    const isUserRegistered = await checkAlreadyRegistered(email);

    if (isUserRegistered) {
      throw new ConflictException(AUTH_EXCEPTION.CONFLICT.EMAIL);
    }

    const requestPayload = {
      name,
      email,
      password: "",
      profile_picture: picture.data.url,
      login_type: loginType,
      refresh_token: longLivedToken,
      refresh_token_expiry: expiresAt,
    };

    addNewFacebookUser(requestPayload);

    res.status(201).json({
      success: true,
      token: longLivedToken,
      message: AUTH.REGISTER.FACEBOOK,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { accessToken } = req.body;
  checkLoginType(req, res, next, accessToken);
};
