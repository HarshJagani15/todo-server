import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { userModel } from "../../models/user-model";

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(404).json({ message: "Access denied!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded) {
      return res
        .status(401)
        .json({ error: "Provided token is invalid or expired!" });
    }

    req.user = decoded;
    const loginUser: any = await userModel.findOne({
      email: req.user.email,
    });
    if (!loginUser) {
      res.status(404).send("Email Not Found");
      return;
    } else {
      next();
    }
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Provided token is invalid or expired!" });
  }
};
