import { body } from "express-validator";

export const editPanelNameValidation = [
  body("_id").notEmpty().withMessage("Panel id is required!"),

  body("name").notEmpty().withMessage("Panel name is required!"),
];
