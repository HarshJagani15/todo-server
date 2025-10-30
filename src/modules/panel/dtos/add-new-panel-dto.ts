import { body } from "express-validator";

export const addNewPanelValidation = [
  body("name").notEmpty().withMessage("Panel name is required!"),
];
