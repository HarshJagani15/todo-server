import express from "express";
import {
  deleteComment,
  addComment,
  addTodo,
  deleteTodo,
  editComment,
  editTodoDescription,
  editTodoHeading,
  updateTodoStatus,
} from "../src/modules/todo/todo-controller";
import { updateTodoStatusValidation } from "../src/modules/todo/dtos/update-todo-status-dto";
import { validateRequest } from "../core/middleware/validator";
import { addTodoValidation } from "../src/modules/todo/dtos/add-todo-dto";
import { editTodoHeadingValidation } from "../src/modules/todo/dtos/edit-todo-heading-dto";
import { deleteTodoValidation } from "../src/modules/todo/dtos/delete-todo-dto";
import { editTodoDescriptionValidation } from "../src/modules/todo/dtos/edit-todo-description-dto";
import { addCommentValidation } from "../src/modules/todo/dtos/add-comment-dto";
import { editCommentValidation } from "../src/modules/todo/dtos/edit-comment-dto";
import { deleteCommentValidation } from "../src/modules/todo/dtos/delete-comment-dto";

export const todoRoutes = express.Router();

todoRoutes.post(
  "/update-todo-status",
  updateTodoStatusValidation,
  validateRequest,
  updateTodoStatus
);

todoRoutes.post("/", addTodoValidation, validateRequest, addTodo);

todoRoutes.delete("/", deleteTodoValidation, validateRequest, deleteTodo);

todoRoutes.put(
  "/heading",
  editTodoHeadingValidation,
  validateRequest,
  editTodoHeading
);

todoRoutes.put(
  "/description",
  editTodoDescriptionValidation,
  validateRequest,
  editTodoDescription
);

todoRoutes.post("/comment", addCommentValidation, validateRequest, addComment);

todoRoutes.put("/comment", editCommentValidation, validateRequest, editComment);

todoRoutes.delete(
  "/comment",
  deleteCommentValidation,
  validateRequest,
  deleteComment
);
