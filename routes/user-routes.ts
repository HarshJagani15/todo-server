import express from "express";
import {
  updateUserName,
  userProfileController,
} from "../controllers/user-controller";
import {
  updateProfilePicture,
  uploadPicture,
} from "../utils/profile-picture-util";

export const userRoutes = express.Router();

userRoutes.get("/userProfile", userProfileController);
userRoutes.post("/userProfile/picture", uploadPicture, updateProfilePicture);
userRoutes.post("/userProfile/name", updateUserName);
