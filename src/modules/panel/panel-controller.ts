import { Request, Response } from "express";
import { QueryHelper } from "../../../utils/search-util";
import {
  addPanel,
  getPanels,
  removePanel,
  updatePanelName,
} from "./panel-repository";

interface History {
  timestamp: string;
  field: string;
  previous: {
    heading: string;
    description: string;
  };
  updated: {
    heading: string;
    description: string;
  };
}

export const getAllPanels = async (req: Request, res: Response) => {
  try {
    const allPanels = await getPanels();

    allPanels.map(({ todos }) =>
      todos.map((todo: any) => {
        if (todo.histories && Array.isArray(todo.histories)) {
          return {
            ...todo,
            histories: todo.histories.sort(
              (a: History, b: History) =>
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

    res.status(200).send(searchingTodo);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error,
    });
  }
};

export const addNewPanel = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const savedPanel = await addPanel(name);
    res.status(201).json(savedPanel);
  } catch (error) {
    res.sendStatus(500).json({
      success: false,
      message: "Internal Server Error!",
      error,
    });
  }
};

export const editPanelName = async (req: Request, res: Response) => {
  try {
    const { _id, name } = req.body;

    const updatedPanel = await updatePanelName({ id: _id, name });
    res
      .status(200)
      .send({ panel_name: updatedPanel?.name, panel_id: updatedPanel?._id });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error!",
      error,
    });
  }
};

export const deletePanel = async (req: Request, res: Response) => {
  try {
    const { _id } = req.params;

    const deletedPanelId = await removePanel(_id);
    res
      .status(200)
      .send({
        success: true,
        message: "Panel deleted successfully",
        id: deletedPanelId,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error,
    });
  }
};
