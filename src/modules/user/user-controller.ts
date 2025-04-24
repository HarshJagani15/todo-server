import { Request, Response } from "express";
import { userModel } from "../../../models/user-model";
import { updateUserName } from "./user-repository";

export const userProfileController = async (req: Request, res: Response) => {
  try {
    const { email } = req.user;
    const loginUser = await userModel.findOne({ email });

    const user = {
      name: loginUser?.name,
      email: loginUser?.email,
      profileImage: loginUser?.profilePicture,
    };
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Fail to get user info!",
      error,
    });
  }
};

export const editUserName = async (req: Request, res: Response) => {
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
    res
      .status(500)
      .json({ succes: false, message: "Fail to update username!" });
  }
};
