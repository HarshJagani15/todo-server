import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    comment: { type: String, required: [true, "comment text is required"] },
    date: { type: Number, required: [true] },
    todo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todo",
      required: true,
    },
  },
  { timestamps: true }
);

export const CommentModel = mongoose.model("Comment", commentSchema);
