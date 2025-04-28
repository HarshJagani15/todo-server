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
  NotFoundException,
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
        throw new UnauthorizedException("Invalid credentials");
      } else {
        const token = generateToken(email);
        const refreshToken = generateRefreshToken(email);

        res.status(200).json({
          success: true,
          token,
          refreshToken,
          message: "Successfully logged in with Email",
        });
      }
    } else {
      throw new ConflictException(
        "Email address you're trying to use is already associated with an existing account"
      );
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
      throw new NotFoundException(
        "Email address you're trying to use is already associated with an existing account"
      );
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
      message: "Successfully registered with Email",
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
        "Failed to retrieve GitHub access token."
      );
    }

    const email = await retrieveGitHubUserEmail(accessToken);

    const loginUser: IUserDocument | null = await findUserByEmail(email);

    if (loginUser.login_type === "github") {
      res.status(200).json({
        success: true,
        token: accessToken,
        message: "Successfully logged in with GitHub",
      });
    } else {
      throw new ConflictException(
        "Email address you're trying to use is already associated with an existing account"
      );
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
        "Failed to retrieve GitHub access-token"
      );
    }
    const { login: name, avatar_url: profile_picture } =
      await retrieveGitHubUserInfo(accessToken);

    const email = await retrieveGitHubUserEmail(accessToken);

    const isUserRegistered = await checkAlreadyRegistered(email);

    if (isUserRegistered) {
      throw new NotFoundException(
        "Email address you're trying to use is already associated with an existing account"
      );
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
      message: "Successfully registered with GitHub",
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

    const loginUser: IUserDocument | null = await findUserByEmail(email);

    if (loginUser?.login_type !== "facebook") {
      throw new ConflictException(
        "Email address you're trying to use is already associated with an existing account"
      );
    } else {
      await saveTokenInfoInDB({ loginUser, longLivedToken, expiresAt });

      res.status(200).json({
        success: true,
        token: longLivedToken,
        message: "Successfully logged in with FaceBook",
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
        "Provided access token is invalid or expired."
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
      throw new NotFoundException(
        "Email address you're trying to use is already associated with an existing account"
      );
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
      message: "Successfully registered with FaceBook",
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
