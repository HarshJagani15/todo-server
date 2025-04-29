import { NextFunction, Request, Response } from "express";
import { QueryHelper } from "../../../utils/search";
import {
  addPanel,
  getPanels,
  removePanel,
  updatePanelName,
} from "./panel-repository";
import { PANEL } from "../../../utils/constants";

export const getAllPanels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allPanels = await getPanels();

    allPanels.map(({ todos }) =>
      todos.map((todo) => {
        if (todo.histories && Array.isArray(todo.histories)) {
          return {
            ...todo,
            histories: todo.histories.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            ),
          };
        }
        return todo;
      })
    );

    const { search } = req.query;
    const searchTerm = typeof search === "string" ? search : "";
    const obj = new QueryHelper(allPanels);
    const searchingTodo = obj.applyQuery({
      search: searchTerm,
      searchFields: ["heading"],
    });

    res.status(200).send({
      success: true,
      message: PANEL.FETCHED,
      panels: searchingTodo,
    });
  } catch (error) {
    next(error);
  }
};

export const addNewPanel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    const newPanel = await addPanel(name);
    res.status(201).json({
      success: true,
      message: PANEL.ADD,
      newPanel,
    });
  } catch (error) {
    next(error);
  }
};

export const editPanelName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, name } = req.body;

    const updatedPanel = await updatePanelName({ id: _id, name });
    res.status(200).send({
      success: true,
      message: PANEL.UPDATE_NAME,
      panel_name: updatedPanel?.name,
      panel_id: updatedPanel?._id,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePanel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id } = req.params;

    const deletedPanelId = await removePanel(_id);
    res.status(200).send({
      success: true,
      message: PANEL.DELETE,
      id: deletedPanelId,
    });
  } catch (error) {
    next(error);
  }
};
