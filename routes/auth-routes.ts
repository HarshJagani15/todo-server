import express from "express";
import {
  facebookLoginController,
  facebookRegisterController,
  githubLoginController,
  githubRegisterController,
  loginController,
  refreshTokenController,
  registerController,
} from "../controllers/auth-controller";

export const authRoutes = express.Router();

authRoutes.post("/signin", loginController);
authRoutes.post("/signup", registerController);
authRoutes.post("/signin/github", githubLoginController);
authRoutes.post("/signin/facebook", facebookLoginController);
authRoutes.post("/signup/github", githubRegisterController);
authRoutes.post("/signup/facebook", facebookRegisterController);
authRoutes.post("/refresh-token", refreshTokenController);
