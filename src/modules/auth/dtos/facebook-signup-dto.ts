import { body } from "express-validator";

export const facebookSignUpValidation = [
  body("accessToken").notEmpty().withMessage("Accesstoken is required!"),

  body("loginType").notEmpty().withMessage("Logintype is required!"),
];
