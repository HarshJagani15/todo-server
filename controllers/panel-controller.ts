import { PanelModel } from "../models/panel-model";
import { Request, Response } from "express";
import { TodoModel } from "../models/todo-model";
import { CommentModel } from "../models/comment-model";
import { QueryHelper } from "../utils/search-util";

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
    const allPanels = await PanelModel.find()
      .populate({
        path: "todos",
        model: "Todo",
        populate: {
          path: "comments",
          model: "Comment",
        },
      })
      .lean();

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
      message: "Fail to fetch panels!",
      error,
    });
  }
};

export const addNewPanel = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      res.status(400).json({
        success: false,
        message: "Panel name is required and must be a string.",
      });
    } else {
      const savedPanel = await PanelModel.create({
        name,
        todos: [],
      });
      res.status(201).json(savedPanel);
    }
  } catch (error) {
    res.sendStatus(500).json({
      success: false,
      message: "Fail to create panel!",
      error,
    });
  }
};

export const editPanel = async (
  req: Request<{}, { name: string; _id: string }>,
  res: Response
) => {
  try {
    const { _id, name } = req.body;
    if (!_id || !name || typeof name !== "string") {
      res.status(400).json({
        success: false,
        message: "Panel name is required and must be a string.",
      });
    } else {
      const updatedPanel = await PanelModel.findByIdAndUpdate(
        _id,
        {
          name: name,
        },
        { new: true }
      );
      res
        .status(200)
        .send({ panel_name: updatedPanel?.name, panel_id: updatedPanel?._id });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error!",
      error,
    });
  }
};

export const deletePanel = async (
  req: Request<{ _id: string }>,
  res: Response
) => {
  try {
    const { _id } = req.params;

    const deletedPanel = await PanelModel.findByIdAndDelete(_id);

    const deletedTodos = await TodoModel.find({ panel: _id });
    const commentIds = deletedTodos.flatMap((todo) => todo.comments);
    await CommentModel.deleteMany({ _id: { $in: commentIds } });

    await TodoModel.deleteMany({ panel: _id });
    res.status(200).send(deletedPanel?._id);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fail to delete panel!",
      error,
    });
  }
};
