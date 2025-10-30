import express from "express";
import {
  facebookSignInController,
  facebookSignUpController,
  githubSignInController,
  githubSignUpController,
  signInController,
  refreshTokenController,
  signUpController,
} from "../src/modules/auth/auth-controller";
import { signInValidation } from "../src/modules/auth/dtos/signin-dto";
import { validateRequest } from "../core/middleware/validator";
import { signUpValidation } from "../src/modules/auth/dtos/signup-dto";
import { githubSignInValidation } from "../src/modules/auth/dtos/github-signin-dto";
import { githubSignUpValidation } from "../src/modules/auth/dtos/github-signup-dto";
import { facebookSignInValidation } from "../src/modules/auth/dtos/facebook-signin-dto";
import { facebookSignUpValidation } from "../src/modules/auth/dtos/facebook-signup-dto";

export const authRoutes = express.Router();

authRoutes.post("/signin", signInValidation, validateRequest, signInController);
authRoutes.post("/signup", signUpValidation, validateRequest, signUpController);
authRoutes.post(
  "/signin/github",
  githubSignInValidation,
  validateRequest,
  githubSignInController
);
authRoutes.post(
  "/signup/github",
  githubSignUpValidation,
  validateRequest,
  githubSignUpController
);
authRoutes.post(
  "/signin/facebook",
  facebookSignInValidation,
  validateRequest,
  facebookSignInController
);
authRoutes.post(
  "/signup/facebook",
  facebookSignUpValidation,
  validateRequest,
  facebookSignUpController
);
authRoutes.post("/refresh-token", refreshTokenController);
