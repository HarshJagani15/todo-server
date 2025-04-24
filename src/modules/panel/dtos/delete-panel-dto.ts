import { param } from "express-validator";

export const deletePanelValidation = [
  param("_id").notEmpty().withMessage("Panel id is required!"),
];
