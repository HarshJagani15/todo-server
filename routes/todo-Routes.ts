import express from "express";
import {
  deleteComment,
  addComment,
  addTodo,
  deleteTodo,
  editComment,
  editTodoDescription,
  editTodoHeading,
  dragDropTodos,
} from "../controllers/todo-controller";

export const todoRoutes = express.Router();

todoRoutes.post("/dragdrop", dragDropTodos);
todoRoutes.post("/", addTodo);
todoRoutes.post("/comment", addComment);

todoRoutes.put("/heading", editTodoHeading);
todoRoutes.put("/description", editTodoDescription);
todoRoutes.put("/comment", editComment);

todoRoutes.delete("/", deleteTodo);
todoRoutes.delete("/comment", deleteComment);
