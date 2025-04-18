import { Request, Response } from "express";
import { TodoModel } from "../models/todo-model";
import { CommentModel } from "../models/comment-model";
import { PanelModel } from "../models/panel-model";

export const dragDropTodos = async (req: Request, res: Response) => {
  try {
    const { todoId, sourcePanelId, targetPanelId } = req.body;
    await TodoModel.findByIdAndUpdate(todoId, { panel: targetPanelId });
    await PanelModel.findByIdAndUpdate(
      sourcePanelId,
      { $pull: { todos: todoId } },
      { new: true }
    );
    await PanelModel.findByIdAndUpdate(
      targetPanelId,
      { $push: { todos: todoId } },
      { new: true }
    );
    res
      .status(200)
      .json({ success: true, todoId, sourcePanelId, targetPanelId });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fail to dragdrop Todo!",
      error,
    });
  }
};

export const addTodo = async (req: Request, res: Response) => {
  try {
    const { heading, _id } = req.body;

    const addedTodo = await TodoModel.create({
      heading,
      description: "",
      comments: [],
      histories: [],
      panel: _id,
    });

    await PanelModel.findByIdAndUpdate(
      _id,
      { $push: { todos: addedTodo._id } },
      { new: true }
    );
    res.status(200).json({ success: true, addedTodo, _id });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fail to create todo!",
      error,
    });
  }
};

export const editTodoHeading = async (req: Request, res: Response) => {
  try {
    const { heading, _id } = req.body;

    const prevTodo = await TodoModel.findById(_id);
    const newTodo = await TodoModel.findByIdAndUpdate(
      _id,
      { heading },
      { new: true }
    );
    if (prevTodo?.heading !== heading) {
      const history = {
        timestamp: new Date().toISOString(),
        field: "Heading",
        previous: {
          heading: prevTodo?.heading,
          description: prevTodo?.description,
        },
        updated: {
          heading: newTodo?.heading,
          description: newTodo?.description,
        },
      };
      const updatedTodo = await TodoModel.findByIdAndUpdate(
        _id,
        {
          $push: { histories: history },
        },
        { new: true }
      );

      updatedTodo?.histories.sort(
        (a: any, b: any) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      res.status(200).json({
        success: true,
        heading: newTodo?.heading,
        todo_id: newTodo?._id,
        history: updatedTodo?.histories,
      });
    } else {
      res.status(200).json({
        success: true,
        heading: newTodo?.heading,
        todo_id: newTodo?._id,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Fail to edit todo heading!",
      error,
    });
  }
};

export const editTodoDescription = async (req: Request, res: Response) => {
  try {
    const { description, _id } = req.body;
    const prevTodo = await TodoModel.findById(_id);
    const newTodo = await TodoModel.findByIdAndUpdate(
      _id,
      { description },
      { new: true }
    );

    if (prevTodo?.description !== description) {
      const history = {
        timestamp: new Date().toISOString(),
        field: "Description",
        previous: {
          heading: prevTodo?.heading,
          description: prevTodo?.description,
        },
        updated: {
          heading: newTodo?.heading,
          description: newTodo?.description,
        },
      };
      const updatedTodo = await TodoModel.findByIdAndUpdate(
        _id,
        {
          $push: { histories: history },
        },
        { new: true }
      );

      updatedTodo?.histories.sort(
        (a: any, b: any) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      res.status(200).json({
        success: true,
        description: newTodo?.description,
        todo_id: newTodo?._id,
        history: updatedTodo?.histories,
      });
    } else {
      res.status(200).json({ success: true, description, _id });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fail to edit todo description!",
      error,
    });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { _id } = req.body;
    await TodoModel.findByIdAndDelete(_id);
    res
      .status(204)
      .json({ success: true, message: "Todo deleted successfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Fail to delete todo!",
      error,
    });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { comment, _id } = req.body;

    const newComment = await CommentModel.create({
      comment,
      date: Date.now(),
      todo: _id,
    });

    await TodoModel.findByIdAndUpdate(_id, {
      $push: { comments: newComment._id },
    });

    res.status(200).json({ success: true, comment: newComment, todo_id: _id });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Fail to add comment!",
      error,
    });
  }
};

export const editComment = async (req: Request, res: Response) => {
  try {
    const { todo_id, comment, _id } = req.body;

    const updatedComment = await CommentModel.findByIdAndUpdate(_id, {
      $set: {
        comment: comment,
        date: Date.now(),
      },
    });

    res
      .status(200)
      .json({ success: true, todo_id, newComment: updatedComment, _id });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fail to edit comment!",
      error,
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { todo_id, comment_id } = req.query;

    await CommentModel.findByIdAndDelete(comment_id);
    await TodoModel.findByIdAndUpdate(
      todo_id,
      { $pull: { comments: comment_id } },
      { new: true }
    );
    res.status(200).json({ success: true, todo_id, comment_id });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Fail to delete comment!",
      error,
    });
  }
};
