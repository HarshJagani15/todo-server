import { Request, Response } from "express";
import { userModel } from "../models/user-model";
import axios from "axios";

export const refreshFacebookToken = async (req: Request, res: Response) => {
  const { accessToken } = req.body;

  try {
    const debugResponse = await axios.get(process.env.FB_DEBUG_TOKEN_URL!, {
      params: {
        input_token: accessToken,
        access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET_ID}`,
      },
    });

    if (debugResponse.data.data.is_valid) {
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

      const loginUser = await userModel.findOne({ email });

      if (!loginUser) {
        res.status(400).json({ message: "token is invalid!" });
      } else {
        loginUser.refreshToken = longLivedToken;
        loginUser.refreshTokenExpiry = expiresAt;
        await loginUser.save();

        res.status(201).json({
          accessToken: longLivedToken,
          message: "Token Refreshed Successfully",
        });
      }
    } else {
      res.status(400).json({ message: "token is invalid!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Inetrnal server error!" });
  }
};
