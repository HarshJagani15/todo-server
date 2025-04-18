import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
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
      required: [true, "comments is required"],
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
  { timestamps: true }
);

export const TodoModel = mongoose.model("Todo", todoSchema);
