import { commentModel } from "../../../models/comment-model";
import { panelModel } from "../../../models/panel-model";
import { todoModel } from "../../../models/todo-model";

interface IUpdatePanelName {
  id: object;
  name: string;
}

export const getPanels = async () => {
  const allPanels = await panelModel
    .find()
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
  const newPanel = await panelModel.create({
    name,
    todos: [],
  });

  return newPanel;
};

export const updatePanelName = async (payload: IUpdatePanelName) => {
  const updatedName = await panelModel.findByIdAndUpdate(
    payload.id,
    {
      name: payload.name,
    },
    { new: true }
  );

  return updatedName;
};

export const removePanel = async (id: string) => {
  const deletedPanel = await panelModel.findByIdAndDelete(id);

  const deletedTodos = await todoModel.find({ panel: id });
  const commentIds = deletedTodos.flatMap((todo) => todo.comments);
  await commentModel.deleteMany({ _id: { $in: commentIds } });

  await todoModel.deleteMany({ panel: id });

  return deletedPanel?._id;
};
