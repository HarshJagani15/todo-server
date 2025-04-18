import { Request, Response } from "express";
import { userModel } from "../models/user-model";

export const userProfileController = async (req: Request, res: Response) => {
  try {
    const { email } = req.user;
    const loginUser = await userModel.findOne({ email });

    const user = {
      name: loginUser?.name,
      email: loginUser?.email,
      profileImage: loginUser?.profileImage,
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

export const updateUserName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { email } = req.user;
    await userModel.findOneAndUpdate({ email }, { $set: { name: name } });
    res.status(200).json({
      succes: true,
      message: "Username updated successfully",
      userName: name,
    });
  } catch (error) {
    res
      .status(500)
      .json({ succes: false, message: "Fail to update username!" });
  }
};
