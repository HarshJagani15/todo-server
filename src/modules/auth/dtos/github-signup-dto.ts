import { body } from "express-validator";

export const githubSignUpValidation = [
  body("code").notEmpty().withMessage("Authorization code is required!"),

  body("loginType").notEmpty().withMessage("Logintype is required!"),
];
