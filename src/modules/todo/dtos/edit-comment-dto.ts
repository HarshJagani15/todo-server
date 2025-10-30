import { body } from "express-validator";

export const editCommentValidation = [
  body("comment").notEmpty().withMessage("Comment is required!"),

  body("_id").notEmpty().withMessage("Comment id is required!"),

  body("todo_id").notEmpty().withMessage("Todo id is required!"),
];
