import { body } from "express-validator";

export const facebookSignInValidation = [
  body("accessToken").notEmpty().withMessage("Accesstoken is required!"),
];
