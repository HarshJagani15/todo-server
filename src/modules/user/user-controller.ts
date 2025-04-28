import { NextFunction, Request, Response } from "express";
import { userModel } from "../../../models/user-model";
import { updateUserName } from "./user-repository";

export const userProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.user;
    const loginUser = await userModel.findOne({ email });

    const user = {
      name: loginUser?.name,
      email: loginUser?.email,
      profileImage: loginUser?.profile_picture,
    };
    res
      .status(200)
      .json({
        success: true,
        message: "User profile fetched successfully",
        user,
      });
  } catch (error) {
    next(error);
  }
};

export const editUserName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const { email } = req.user;
    const user = await updateUserName({ email, name });
    res.status(200).json({
      succes: true,
      message: "Username updated successfully",
      userName: user?.name,
    });
  } catch (error) {
    next(error);
  }
};
