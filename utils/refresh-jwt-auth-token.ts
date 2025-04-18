import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const refreshJwtAuthToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!);

    if (!decoded) {
      res
        .status(401)
        .json({ error: "Provided Refresh Token Is Invalid Or Expired!" });
    } else {
      const { email } = decoded as any;
      const accessToken = jwt.sign({ email }, process.env.JWT_SECRET!, {
        expiresIn: "24h",
      });
      const refreshToken = jwt.sign({ email }, process.env.JWT_SECRET!, {
        expiresIn: "30d",
      });

      res.status(201).json({ accessToken, refreshToken });
    }
  } catch (error) {
    res.status(400).json({ error: "Unauthorized Access!" });
  }
};
