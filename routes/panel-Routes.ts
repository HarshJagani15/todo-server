import express from "express";
import {
  addNewPanel,
  deletePanel,
  editPanel,
  getAllPanels,
} from "../controllers/panel-controller";

export const panelRoutes = express.Router();

panelRoutes.get("/", getAllPanels);

panelRoutes.post("/", addNewPanel);

panelRoutes.put("/", editPanel);

panelRoutes.delete("/:_id", deletePanel);
