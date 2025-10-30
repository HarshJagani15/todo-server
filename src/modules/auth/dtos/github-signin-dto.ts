import { body } from "express-validator";

export const githubSignInValidation = [
  body("code").notEmpty().withMessage("Authorization code is required!"),
];
