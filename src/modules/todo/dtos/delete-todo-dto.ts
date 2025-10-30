import { body } from "express-validator";

export const deleteTodoValidation = [
  body("_id").notEmpty().withMessage("Todo id is required!"),
];
