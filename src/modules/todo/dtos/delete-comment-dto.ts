import { query } from "express-validator";

export const deleteCommentValidation = [
  query("comment_id").notEmpty().withMessage("Comment id is required!"),

  query("todo_id").notEmpty().withMessage("Todo id is required!"),
];
