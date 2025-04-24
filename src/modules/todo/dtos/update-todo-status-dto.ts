import { body } from "express-validator";

export const updateTodoStatusValidation = [
  body("todoId").notEmpty().withMessage("Todo id is required!"),

  body("sourcePanelId").notEmpty().withMessage("Sourcepanel id is required!"),

  body("targetPanelId").notEmpty().withMessage("Targetpanel id is required!")
];
