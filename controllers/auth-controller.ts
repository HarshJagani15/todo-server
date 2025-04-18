import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { userModel } from "../models/user-model";
import axios from "axios";
import { refreshFacebookToken } from "../utils/refresh-facebook-token";
import { refreshGitHubToken } from "../utils/refresh-github-token";
import { refreshJwtAuthToken } from "../utils/refresh-jwt-auth-token";

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user: any = await userModel.findOne({ email });
    if (!user) {
      res.status(404).send({ success: false, message: "Email not found" });
      return;
    }
    if (user.loginType === "email") {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res
          .status(401)
          .send({ success: false, message: "Invalid credentials" });
        return;
      }
      const secretKey: string = process.env.JWT_SECRET!;
      const token = jwt.sign({ email }, secretKey, { expiresIn: "24h" });
      const refreshToken = jwt.sign({ email }, secretKey, { expiresIn: "30d" });
      res.status(200).json({
        success: true,
        token,
        refreshToken,
        message: "Login successful!",
      });
      return;
    } else {
      res.status(409).json({
        success: false,
        message: "Email registered with another account!",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
    });
  }
};

export const registerController = async (req: Request, res: Response) => {
  try {
    const { userName, email, password, loginType } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      const encryptedPassword = await bcrypt.hash(password, 10);
      const newUser = new userModel({
        name: userName,
        email,
        password: encryptedPassword,
        loginType: loginType,
        profileImage: "",
      });
      await newUser.save();
      res.status(201).json({
        success: true,
        message: "Registration successful!",
      });
    } else {
      res
        .status(409)
        .json({ success: false, message: "Email or username already exists" });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Registration fail!",
    });
  }
};

export const githubLoginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code } = req.body;

  if (!code) {
    res
      .status(400)
      .json({ success: false, error: "Authorization code is required" });
  }
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

    const loginUser = await userModel.findOne({ email: primaryEmail });

    if (!loginUser) {
      res.status(404).json({
        success: false,
        message: "Email Not Registered !",
      });
    } else {
      if (loginUser.loginType === "github") {
        res.status(200).json({
          success: true,
          token: access_token,
          message: "Login with Github succesfully",
        });
      } else {
        res.status(409).json({
          success: false,
          message: "Email Registered With Another Account!",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const githubRegisterController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code, loginType } = req.body;
  if (!code) {
    res
      .status(400)
      .json({ success: false, error: "Authorization code is required" });
  }
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

    const loginUser = await userModel.findOne({ email: primaryEmail });

    if (!loginUser) {
      const newUser = new userModel({
        name: user.login,
        email: primaryEmail,
        password: "",
        profileImage: user.avatar_url,
        loginType: loginType,
      });
      await newUser.save();
      res.status(201).json({
        success: true,
        token: access_token,
        message: "Email Registered Successfully",
      });
    } else {
      res.status(409).json({
        success: false,
        message: "Email Already Registered!",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const facebookLoginController = async (
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

    // await axios.delete(`https://graph.facebook.com/v19.0/me/permissions`, {
    //   params: {
    //     access_token: accessToken, // Pass the token you want to revoke
    //   },
    // });

    const longLivedToken = exchangeResponse.data.access_token;
    const expiresIn = exchangeResponse.data.expires_in;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    const user = await userModel.findOne({ email });

    if (!user) {
      res
        .status(404)
        .json({ success: false, message: "Email Not Registered!" });
    } else {
      if (user?.loginType !== "facebook") {
        res.status(409).json({
          success: false,
          message: "Email Registered With Another Account!",
        });
      } else {
        user.refreshToken = longLivedToken;
        user.refreshTokenExpiry = expiresAt;
        await user.save();

        res.status(200).json({
          success: true,
          token: longLivedToken,
          message: "Login with Facebook successful",
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error!!!" });
  }
};

export const facebookRegisterController = async (
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

    // await axios.delete(`https://graph.facebook.com/v19.0/me/permissions`, {
    //   params: {
    //     access_token: accessToken, // Pass the token you want to revoke
    //   },
    // });

    const longLivedToken = exchangeResponse.data.access_token;
    const expiresIn = exchangeResponse.data.expires_in;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    const loginUser = await userModel.findOne({ email: email });
    if (!loginUser) {
      const newUser = new userModel({
        name: name,
        email: email,
        password: "",
        profileImage: picture.data.url,
        loginType: loginType,
        refreshToken: longLivedToken,
        refreshTokenExpiry: expiresAt,
      });
      await newUser.save();
      res.status(201).json({
        success: true,
        token: longLivedToken,
        message: "Sign up with facebook succesfully",
      });
    } else {
      res.status(409).json({
        success: false,
        message: "Email Already Registered!",
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
