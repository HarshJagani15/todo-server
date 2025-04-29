import mongoose from "mongoose";
import { Document } from "mongoose";

export interface IComment {
  _id: object;
  comment: string;
  date: number;
  todo: object;
}

export type ICommentDocument = IComment & Document;

const commentSchema = new mongoose.Schema<ICommentDocument>(
  {
    comment: { type: String, required: true },
    date: { type: Number, required: true },
    todo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todo",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const commentModel = mongoose.model("Comment", commentSchema);
