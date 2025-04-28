import multer from "multer";
import { NextFunction, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { userModel } from "../models/user-model";
import { BadRequestException, NotFoundException } from "./error-exceptions";

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "./uploads");
  },
  filename: function (_req, file, cb) {
    const extName = path.extname(file.originalname);
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + extName;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

export const uploadPicture = upload.single("image");

export const updateProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new BadRequestException("No file uploaded!");
    }

    const { email } = req.user;

    const user = await userModel.findOne({
      email,
    });

    if (!user) {
      throw new NotFoundException(
        "Email address you're using is not associated with any account"
      );
    }

    if (!user?.profile_picture?.startsWith("https://") && user?.profile_picture) {
      const filePath = path.join(
        __dirname,
        "../uploads",
        user?.profile_picture!
      );

      await fs.promises.access(filePath, fs.constants.F_OK);

      await fs.promises.unlink(filePath);
      user.profile_picture = req.file?.filename;
      await user.save();

      res.status(200).json({
        message: "Profile picture uploaded successfully",
        filePath: req.file?.filename,
      });
      return;
    } else {
      user.profile_picture = req.file?.filename;
      await user?.save();

      res.status(200).json({
        message: "Profile picture uploaded successfully",
        filePath: req.file?.filename,
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};
