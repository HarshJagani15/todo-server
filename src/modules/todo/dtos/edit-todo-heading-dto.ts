import { body } from "express-validator";

export const editTodoHeadingValidation = [
  body("heading").notEmpty().withMessage("Todo heading is required!"),

  body("_id").notEmpty().withMessage("Todo id is required!"),
];
