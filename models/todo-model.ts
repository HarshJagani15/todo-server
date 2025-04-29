import mongoose from "mongoose";
import { Document } from "mongoose";
import { IComment } from "./comment-model";

export type ITodoDocument = ITodo & Document;

export interface IHistory {
  timestamp: string;
  field: string;
  previous: {
    heading: string;
    description: string | null;
  };
  updated: {
    heading: string;
    description: string | null;
  };
}

export interface ITodo {
  _id: object;
  heading: string;
  description: string;
  comments: IComment[];
  histories: IHistory[];
  panel: object;
}

const todoSchema = new mongoose.Schema<ITodoDocument>(
  {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    comments: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment",
        },
      ],
      required: true,
    },
    histories: {
      type: [],
      required: true,
    },
    panel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panel",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const todoModel = mongoose.model("Todo", todoSchema);
