import mongoose from "mongoose";
import { Document } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  profilePicture: string;
  loginType: string;
  refreshToken: string;
  refreshTokenExpiry: number;
}

export type IUserDocument = IUser & Document;

const userSchema = new mongoose.Schema<IUserDocument>(
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
    profilePicture: {
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
