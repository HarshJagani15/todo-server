import { body } from "express-validator";

export const addCommentValidation = [
  body("comment").notEmpty().withMessage("Comment is required!"),

  body("_id").notEmpty().withMessage("Todo id is required!"),
];
