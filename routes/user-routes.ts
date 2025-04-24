import express from "express";
import {
  editUserName,
  userProfileController,
} from "../src/modules/user/user-controller";
import {
  updateProfilePicture,
  uploadPicture,
} from "../utils/profile-picture-util";
import { editUserNameValidation } from "../src/modules/user/dtos/edit-username-dto";
import { validateRequest } from "../core/middleware/validator";

export const userRoutes = express.Router();

userRoutes.get("/userProfile", userProfileController);
userRoutes.post("/userProfile/picture", uploadPicture, updateProfilePicture);
userRoutes.post(
  "/userProfile/name",
  editUserNameValidation,
  validateRequest,
  editUserName
);
