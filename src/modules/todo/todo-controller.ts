import { Request, Response } from "express";
import {
  addNewComment,
  addNewTodo,
  changeTodoStatus,
  deleteExistingComment,
  editExistingComment,
  findPrevTodo,
  removeTodo,
  TodoHistoryUpdate,
  updateTodoDescription,
  updateTodoHeading,
} from "./todo-repository";

export const updateTodoStatus = async (req: Request, res: Response) => {
  try {
    const { todoId, sourcePanelId, targetPanelId } = req.body;
    await changeTodoStatus({ todoId, sourcePanelId, targetPanelId });
    res
      .status(200)
      .json({ success: true, todoId, sourcePanelId, targetPanelId });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error,
    });
  }
};

export const addTodo = async (req: Request, res: Response) => {
  try {
    const { _id, heading } = req.body;
    const addedTodo = await addNewTodo({ id: _id, heading });

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
    const { _id, heading } = req.body;

    const prevTodo = await findPrevTodo(_id);

    if (prevTodo?.heading !== heading) {
      const newTodo = await updateTodoHeading({ id: _id, heading });
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
      const updatedTodo = await TodoHistoryUpdate({ id: _id, history });

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
      res.status(409).json({
        success: false,
        message: "Same as previous one",
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
    const prevTodo = await findPrevTodo(_id);

    if (prevTodo?.description !== description) {
      const newTodo = await updateTodoDescription({ id: _id, description });
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
      const updatedTodo = await TodoHistoryUpdate({ id: _id, history });

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
    const deletedTodoId = await removeTodo(_id);
    res.status(204).json({
      success: true,
      message: "Todo deleted successfully",
      id: deletedTodoId,
    });
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

    const newComment = await addNewComment({ id: _id, comment });

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

    const updatedComment = await editExistingComment({ id: _id, comment });

    res.status(200).json({
      success: true,
      newUpdatedComment: updatedComment?.comment,
      commentId: updatedComment?._id,
      todoId: todo_id,
    });
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

    const deletedComment = await deleteExistingComment({
      todoId: todo_id as object,
      commentId: comment_id as object,
    });
    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      todoId: todo_id,
      commentId: deletedComment?._id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Fail to delete comment!",
      error,
    });
  }
};
