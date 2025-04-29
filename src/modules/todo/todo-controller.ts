import { NextFunction, Request, Response } from "express";
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
import { ConflictException } from "../../../utils/error-exceptions";
import { TODO_COMMENT, TODO_EXCEPTION, TODO } from "../../../utils/constants";

export const updateTodoStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { todoId, sourcePanelId, targetPanelId } = req.body;
    await changeTodoStatus({ todoId, sourcePanelId, targetPanelId });
    res.status(200).json({
      success: true,
      message: "Todod status updated successfully",
      todoId,
      sourcePanelId,
      targetPanelId,
    });
  } catch (error) {
    next(error);
  }
};

export const addTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, heading } = req.body;
    const addedTodo = await addNewTodo({ id: _id, heading });

    res.status(201).json({
      success: true,
      message: TODO.ADD,
      addedTodo,
      _id,
    });
  } catch (error) {
    next(error);
  }
};

export const editTodoHeading = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, heading } = req.body;

    const prevTodo = await findPrevTodo(_id);

    if (prevTodo?.heading !== heading) {
      const newTodo = await updateTodoHeading({ id: _id, heading });
      const history = {
        timestamp: new Date().toISOString(),
        field: "Heading",
        previous: {
          heading: prevTodo?.heading ?? "",
          description: prevTodo?.description ?? null,
        },
        updated: {
          heading: newTodo?.heading ?? "",
          description: newTodo?.description ?? null,
        },
      };
      const updatedTodo = await TodoHistoryUpdate({ id: _id, history });

      updatedTodo?.histories.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      res.status(200).json({
        success: true,
        message: TODO.UPDATE_HEADING,
        heading: newTodo?.heading,
        todo_id: newTodo?._id,
        history: updatedTodo?.histories,
      });
    } else {
      throw new ConflictException(TODO_EXCEPTION.CONFLICT.HEADING);
    }
  } catch (error) {
    next(error);
  }
};

export const editTodoDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { description, _id } = req.body;
    const prevTodo = await findPrevTodo(_id);

    if (prevTodo?.description !== description) {
      const newTodo = await updateTodoDescription({ id: _id, description });
      const history = {
        timestamp: new Date().toISOString(),
        field: "Heading",
        previous: {
          heading: prevTodo?.heading ?? "",
          description: prevTodo?.description ?? null,
        },
        updated: {
          heading: newTodo?.heading ?? "",
          description: newTodo?.description ?? null,
        },
      };
      const updatedTodo = await TodoHistoryUpdate({ id: _id, history });

      updatedTodo?.histories.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      res.status(200).json({
        success: true,
        message: TODO.UPDATE_DESCRIPTION,
        description: newTodo?.description,
        todo_id: newTodo?._id,
        history: updatedTodo?.histories,
      });
    } else {
      throw new ConflictException(TODO_EXCEPTION.CONFLICT.DESCRIPTION);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id } = req.body;
    const deletedTodoId = await removeTodo(_id);
    res.status(200).json({
      success: true,
      message: TODO.DELETE,
      id: deletedTodoId,
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { comment, _id } = req.body;

    const newComment = await addNewComment({ id: _id, comment });

    res.status(201).json({
      success: true,
      message: TODO_COMMENT.ADD,
      comment: newComment,
      todo_id: _id,
    });
  } catch (error) {
    next(error);
  }
};

export const editComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { todo_id, comment, _id } = req.body;

    const updatedComment = await editExistingComment({ id: _id, comment });

    res.status(200).json({
      success: true,
      message: TODO_COMMENT.UPDATE,
      newUpdatedComment: updatedComment?.comment,
      commentId: updatedComment?._id,
      todoId: todo_id,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { todo_id, comment_id } = req.query;

    const deletedComment = await deleteExistingComment({
      todoId: todo_id as object,
      commentId: comment_id as object,
    });
    res.status(200).json({
      success: true,
      message: TODO_COMMENT.DELETE,
      todoId: todo_id,
      commentId: deletedComment?._id,
    });
  } catch (error) {
    next(error);
  }
};
