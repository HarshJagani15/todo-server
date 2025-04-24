import { body } from "express-validator";

export const editUserNameValidation = [
  body("name").notEmpty().withMessage("Username is required!"),
];
