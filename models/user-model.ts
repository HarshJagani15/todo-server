import mongoose from "mongoose";
import { Document } from "mongoose";

export interface IUser {
  _id?: object;
  name: string;
  email: string;
  password: string;
  profile_picture: string;
  login_type: string;
  refresh_token?: string;
  refresh_token_expiry?: number;
}

export type IUserDocument = IUser & Document;

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    profile_picture: {
      type: String,
    },
    login_type: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
    },
    refresh_token_expiry: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const userModel = mongoose.model("users", userSchema);
