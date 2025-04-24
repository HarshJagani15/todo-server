import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { userModel } from "../../models/user-model";

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export const verifyFacebookToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(404)
      .json({ message: "Access Denied! No token provided." });
  }
  try {
    const debugResponse = await axios.get(process.env.FB_DEBUG_TOKEN_URL!, {
      params: {
        input_token: token,
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
            access_token: token,
          },
        }
      );
      const { email } = userResponse.data;

      const loginUser: any = await userModel.findOne({ email: email });

      if (!loginUser) {
        res.status(404).send("Email Not Found");
      } else {
        const refreshTokenExpiry = loginUser.refreshTokenExpiry;

        const currentTime = Math.floor(Date.now() / 1000);
        const FIVE_DAYS_IN_SECONDS = 5 * 24 * 60 * 60;
        if (refreshTokenExpiry - currentTime < FIVE_DAYS_IN_SECONDS) {
          return res
            .status(401)
            .json({ message: "Provided token is invalid or expired!" });
        } else {
          req.user = { email: email };
          next();
        }
      }
    } else {
      return res.status(400).json({ message: "Provided token is invalid!" });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Provided token is invalid or expired!" });
  }
};
