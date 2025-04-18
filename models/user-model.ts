import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required and should be unique"],
      unique: true,
    },
    password: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    loginType: {
      type: String,
      required: [true, "login type is required"],
    },
    refreshToken: {
      type: String,
    },
    refreshTokenExpiry: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const userModel = mongoose.model("users", userSchema);
