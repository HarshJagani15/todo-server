import { body } from "express-validator";

export const editTodoDescriptionValidation = [
  body("description").notEmpty().withMessage("Todo description is required!"),

  body("_id").notEmpty().withMessage("Todo id is required!"),
];
