import multer from "multer";
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { userModel } from "../models/user-model";
// import mime from "mime";

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
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded!" });
      return;
    }

    const { email } = req.user as any;

    const user: any = await userModel.findOne({ email });

    if (!user?.profileImage?.startsWith("https://") && user?.profileImage) {
      const filePath = path.join(__dirname, "../uploads", user?.profileImage!);
      try {
        await fs.promises.access(filePath, fs.constants.F_OK);
      } catch (err) {
        res.status(404).send({ message: "Fail to update profile picture!" });
        return;
      }

      try {
        await fs.promises.unlink(filePath);
        user.profileImage = req.file?.filename;
        await user.save();

        res.status(200).json({
          message: "Profile picture uploaded successfully!",
          filePath: req.file?.filename,
        });
        return;
      } catch (err) {
        res.status(500).send({ message: "Fail to update profile picture!" });
        return;
      }
    } else {
      user.profileImage = req.file?.filename;
      await user?.save();

      res.status(200).json({
        message: "Profile picture uploaded successfully!",
        filePath: req.file?.filename,
      });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: "Fail to update profile picture!" });
  }
};
