import express from "express";
import {
  addNewPanel,
  deletePanel,
  editPanelName,
  getAllPanels,
} from "../src/modules/panel/panel-controller";
import { validateRequest } from "../core/middleware/validator";
import { addNewPanelValidation } from "../src/modules/panel/dtos/add-new-panel-dto";
import { editPanelNameValidation } from "../src/modules/panel/dtos/edit-panel-name-dto";
import { deletePanelValidation } from "../src/modules/panel/dtos/delete-panel-dto";

export const panelRoutes = express.Router();

panelRoutes.get("/", getAllPanels);

panelRoutes.post("/", addNewPanelValidation, validateRequest, addNewPanel);

panelRoutes.put("/", editPanelNameValidation, validateRequest, editPanelName);

panelRoutes.delete(
  "/:_id",
  deletePanelValidation,
  validateRequest,
  deletePanel
);
