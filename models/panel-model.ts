import mongoose from "mongoose";
import { Document } from "mongoose";
import { ITodo } from "./todo-model";

export interface IPanel {
  _id: object;
  name: string;
  todos: ITodo[];
}

export type IPanelDocument = IPanel & Document;

const panelSchema = new mongoose.Schema<IPanelDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    todos: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Todo",
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

export const PanelModel = mongoose.model("Panel", panelSchema);
