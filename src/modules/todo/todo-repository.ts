import { commentModel } from "../../../models/comment-model";
import { panelModel } from "../../../models/panel-model";
import { IHistory, todoModel } from "../../../models/todo-model";

interface IChangeTodoStatus {
  todoId: object;
  sourcePanelId: object;
  targetPanelId: object;
}

interface IAddNewTodo {
  id: object;
  heading: string;
}

interface IUpdateTodoHeading extends IAddNewTodo {}

interface IUpdateTodoDescription {
  id: object;
  description: string;
}

interface ITodoHistoryUpdate {
  id: object;
  history: IHistory;
}

interface IAddNewComment {
  id: object;
  comment: string;
}

interface IEditExistingComment {
  id: object;
  comment: string;
}

interface IDeleteExistingComment {
  todoId: object;
  commentId: object;
}

export const changeTodoStatus = async (payload: IChangeTodoStatus) => {
  await todoModel.findByIdAndUpdate(payload.todoId, {
    panel: payload.targetPanelId,
  });
  await panelModel.findByIdAndUpdate(
    payload.sourcePanelId,
    { $pull: { todos: payload.todoId } },
    { new: true }
  );
  await panelModel.findByIdAndUpdate(
    payload.targetPanelId,
    { $push: { todos: payload.todoId } },
    { new: true }
  );
};

export const addNewTodo = async (payload: IAddNewTodo) => {
  const addedTodo = await todoModel.create({
    heading: payload.heading,
    description: "",
    comments: [],
    histories: [],
    panel: payload.id,
  });

  await panelModel.findByIdAndUpdate(
    payload.id,
    { $push: { todos: addedTodo._id } },
    { new: true }
  );

  return addedTodo;
};

export const findPrevTodo = async (id: object) => {
  const prevTodo = await todoModel.findById(id);
  return prevTodo;
};

export const updateTodoHeading = async (payload: IUpdateTodoHeading) => {
  const newTodo = await todoModel.findByIdAndUpdate(
    payload.id,
    { heading: payload.heading },
    { new: true }
  );
  return newTodo;
};

export const TodoHistoryUpdate = async (payload: ITodoHistoryUpdate) => {
  const updatedTodo = await todoModel.findByIdAndUpdate(
    payload.id,
    {
      $push: { histories: payload.history },
    },
    { new: true }
  );

  return updatedTodo;
};

export const updateTodoDescription = async (
  payload: IUpdateTodoDescription
) => {
  const newTodo = await todoModel.findByIdAndUpdate(
    payload.id,
    { description: payload.description },
    { new: true }
  );
  return newTodo;
};

export const removeTodo = async (id: object) => {
  await todoModel.findByIdAndDelete(id);
};

export const addNewComment = async (payload: IAddNewComment) => {
  const newComment = await commentModel.create({
    comment: payload.comment,
    date: Date.now(),
    todo: payload.id,
  });

  await todoModel.findByIdAndUpdate(payload.id, {
    $push: { comments: newComment._id },
  });

  return newComment;
};

export const editExistingComment = async (payload: IEditExistingComment) => {
  const updatedComment = await commentModel.findByIdAndUpdate(
    payload.id,
    {
      $set: {
        comment: payload.comment,
        date: Date.now(),
      },
    },
    { new: true }
  );

  return updatedComment;
};

export const deleteExistingComment = async (
  payload: IDeleteExistingComment
) => {
  const deletedComment = await commentModel.findByIdAndDelete(
    payload.commentId
  );
  await todoModel.findByIdAndUpdate(
    payload.todoId,
    { $pull: { comments: payload.commentId } },
    { new: true }
  );
  return deletedComment;
};
