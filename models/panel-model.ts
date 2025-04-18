import mongoose from "mongoose";

const panelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    todos: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Todo",
        },
      ],
      required: [true, "Todos is required"],
    },
  },
  { timestamps: true }
);

export const PanelModel = mongoose.model("Panel", panelSchema);
