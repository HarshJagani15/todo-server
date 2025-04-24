import { CommentModel } from "../../../models/comment-model";
import { PanelModel } from "../../../models/panel-model";
import { TodoModel } from "../../../models/todo-model";

interface IUpdatePanelName {
  id: object;
  name: string;
}

export const getPanels = async () => {
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

  return allPanels;
};

export const addPanel = async (name: string) => {
  const newPanel = await PanelModel.create({
    name,
    todos: [],
  });

  return newPanel;
};

export const updatePanelName = async (payload: IUpdatePanelName) => {
  const updatedName = await PanelModel.findByIdAndUpdate(
    payload.id,
    {
      name: payload.name,
    },
    { new: true }
  );

  return updatedName;
};

export const removePanel = async (id: string) => {
  const deletedPanel = await PanelModel.findByIdAndDelete(id);

  const deletedTodos = await TodoModel.find({ panel: id });
  const commentIds = deletedTodos.flatMap((todo) => todo.comments);
  await CommentModel.deleteMany({ _id: { $in: commentIds } });

  await TodoModel.deleteMany({ panel: id });

  return deletedPanel?._id;
};
