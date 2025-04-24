import { Request, Response } from "express";
import { IUserDocument } from "../../../models/user-model";
import axios from "axios";
import { refreshFacebookToken } from "../../../utils/refresh-facebook-token";
import { refreshGitHubToken } from "../../../utils/refresh-github-token";
import { refreshJwtAuthToken } from "../../../utils/refresh-jwt-auth-token";
import {
  addNewFacebookUser,
  addNewUser,
  findUser,
  saveToken,
} from "./auth-repository";
import {
  comparePassword,
  generateRefreshToken,
  generateToken,
  passwordEncryption,
} from "./auth-services";

export const signInController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user: IUserDocument | null = await findUser(email);

    if (!user) {
      res.status(404).send({
        success: false,
        message:
          "Email address you're using is not associated with any account",
      });
    } else if (user.loginType === "email") {
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      } else {
        const token = generateToken(email);
        const refreshToken = generateRefreshToken(email);
        res.status(200).json({
          success: true,
          token,
          refreshToken,
          message: "Login successful!",
        });
      }
    } else {
      res.status(409).json({
        success: false,
        message: "Email already associated with another account",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
};

export const signUpController = async (req: Request, res: Response) => {
  try {
    const { userName, email, password, loginType } = req.body;

    const user: IUserDocument | null = await findUser(email);
    if (!user) {
      const encryptedPassword = await passwordEncryption(password);
      await addNewUser({
        userName,
        email,
        password: encryptedPassword,
        profilePicture: "",
        loginType,
      });
      res.status(201).json({
        success: true,
        message: "Registration successful!",
      });
    } else {
      res.status(409).json({
        success: false,
        message: "Email already associated with another account",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Registration fail!",
    });
  }
};

export const githubSignInController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code } = req.body;

  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      null,
      {
        params: {
          client_id: process.env.GITHUB_APP_ID,
          client_secret: process.env.GITHUB_APP_SECRET_ID,
          code: code,
          redirect_uri: "http://localhost:3000/auth/github/callback",
        },
        headers: {
          Accept: "application/json",
        },
      }
    );
    const { access_token } = response.data;

    if (!access_token) {
      res
        .status(500)
        .json({ success: false, error: "Failed to retrieve access token" });
      return;
    }

    const { data: emails } = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const primaryEmail = emails.find((email: any) => email.primary)?.email;

    const loginUser: IUserDocument | null = await findUser(primaryEmail);

    if (!loginUser) {
      res.status(404).json({
        success: false,
        message: "Email Not Registered !",
      });
    } else if (loginUser.loginType === "github") {
      res.status(200).json({
        success: true,
        token: access_token,
        message: "Login with Github succesfully",
      });
    } else {
      res.status(409).json({
        success: false,
        message: "Email already associated with another account",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const githubSignUpController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code, loginType } = req.body;

  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      null,
      {
        params: {
          client_id: process.env.GITHUB_APP_ID,
          client_secret: process.env.GITHUB_APP_SECRET_ID,
          code: code,
          redirect_uri: "http://localhost:3000/auth/github/callback",
        },
        headers: {
          Accept: "application/json",
        },
      }
    );
    const { access_token } = response.data;

    if (!access_token) {
      res
        .status(500)
        .json({ success: false, error: "Failed to retrieve access token" });
    } else {
      const { data: user } = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const { data: emails } = await axios.get(
        "https://api.github.com/user/emails",
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      const primaryEmail = emails.find((email: any) => email.primary)?.email;

      const loginUser: IUserDocument | null = await findUser(primaryEmail);

      if (!loginUser) {
        addNewUser({
          userName: user.login,
          email: primaryEmail,
          password: "",
          profilePicture: user.avatar_url,
          loginType: loginType,
        });

        res.status(201).json({
          success: true,
          token: access_token,
          message: "Email Registered Successfully",
        });
      } else {
        res.status(409).json({
          success: false,
          message: "Email already associated with another account",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const facebookSignInController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { accessToken } = req.body;

    const debugResponse = await axios.get(process.env.FB_DEBUG_TOKEN_URL!, {
      params: {
        input_token: accessToken,
        access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET_ID}`,
      },
    });

    const userId = debugResponse.data.data.user_id;

    const userResponse = await axios.get(
      `${process.env.FB_USER_INFO_URL!}/${userId}`,
      {
        params: {
          fields: "id,name,email,picture",
          access_token: accessToken,
        },
      }
    );

    const { email } = userResponse.data;

    const exchangeResponse = await axios.get(
      process.env.FB_EXCHANGE_TOKEN_URL!,
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET_ID,
          fb_exchange_token: accessToken,
        },
      }
    );

    const longLivedToken = exchangeResponse.data.access_token;
    const expiresIn = exchangeResponse.data.expires_in;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    const user: IUserDocument | null = await findUser(email);

    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "Email Not Registered!" });
    } else if (user?.loginType !== "facebook") {
      res.status(409).json({
        success: false,
        message: "Email already associated with another account",
      });
    } else {
      await saveToken({ user, longLivedToken, expiresAt });

      res.status(200).json({
        success: true,
        token: longLivedToken,
        message: "Login with Facebook successful",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error!!!" });
  }
};

export const facebookSignUpController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { accessToken, loginType } = req.body;
    const debugResponse = await axios.get(process.env.FB_DEBUG_TOKEN_URL!, {
      params: {
        input_token: accessToken,
        access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET_ID}`,
      },
    });

    const userId = debugResponse.data.data.user_id;

    const userResponse = await axios.get(
      `${process.env.FB_USER_INFO_URL}/${userId}`,
      {
        params: {
          fields: "id,name,email,picture",
          access_token: accessToken,
        },
      }
    );

    const { name, email, picture } = userResponse.data;

    const exchangeResponse = await axios.get(
      process.env.FB_EXCHANGE_TOKEN_URL!,
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET_ID,
          fb_exchange_token: accessToken,
        },
      }
    );

    const longLivedToken = exchangeResponse.data.access_token;
    const expiresIn = exchangeResponse.data.expires_in;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    const loginUser = await findUser(email);

    if (!loginUser) {
      const requestPayload = {
        name,
        email,
        password: "",
        profilePicture: picture.data.url,
        loginType: loginType,
        refreshToken: longLivedToken,
        refreshTokenExpiry: expiresAt,
      };

      addNewFacebookUser(requestPayload);

      res.status(201).json({
        success: true,
        token: longLivedToken,
        message: "Sign up with facebook succesfully",
      });
    } else {
      res.status(409).json({
        success: false,
        message: "Email already associated with another account",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { accessToken } = req.body;

  if (accessToken?.startsWith("EAA")) {
    return refreshFacebookToken(req, res);
  } else if (/^gh[p|o]_[A-Za-z0-9]+$/.test(accessToken!)) {
    return refreshGitHubToken(req, res);
  } else {
    return refreshJwtAuthToken(req, res);
  }
};
