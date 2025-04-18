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

export const verifyGitHubToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(404).json({ error: "Access Denied! No token provided." });
  }

  try {
    const { data: emails } = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    try {
      const primaryEmail = emails.find((email: any) => email.primary)?.email;
      if (!primaryEmail) {
        return res
          .status(401)
          .json({ error: "Invalid or expired GitHub token!" });
      }
      req.user = { email: primaryEmail };

      const loginUser: any = await userModel.findOne({ email: primaryEmail });
      if (!loginUser) {
        res.status(404).send("Email Not Found");
        return;
      } else {
        next();
      }
    } catch (error) {
      return res
        .status(401)
        .json({ error: "Invalid or expired GitHub token!" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};
