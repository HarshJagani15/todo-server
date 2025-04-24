import { IUserDocument, userModel } from "../../../models/user-model";

interface IAddNewUser {
  userName: string;
  email: string;
  password: string;
  profilePicture: string;
  loginType: string;
}

interface ISaveToken {
  user: IUserDocument;
  longLivedToken: string;
  expiresAt: number;
}

interface IAddNewFacebookUser {
  name: string;
  email: string;
  password: string;
  profilePicture: string;
  loginType: string;
  refreshToken: string;
  refreshTokenExpiry: number;
}

export const findUser = async (email: string) => {
  const user = await userModel.findOne({ email });
  return user;
};

export const addNewUser = async (payload: IAddNewUser) => {
  const newUser = new userModel({
    name: payload.userName,
    email: payload.email,
    password: payload.password,
    profilePicture: payload.profilePicture,
    loginType: payload.loginType,
  });
  await newUser.save();
};

export const saveToken = async (payload: ISaveToken) => {
  payload.user.refreshToken = payload.longLivedToken;
  payload.user.refreshTokenExpiry = payload.expiresAt;
  await payload.user.save();
};

export const addNewFacebookUser = async (payload: IAddNewFacebookUser) => {
  const newUser = new userModel({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    profileImage: payload.profilePicture,
    loginType: payload.loginType,
    refreshToken: payload.refreshToken,
    refreshTokenExpiry: payload.refreshTokenExpiry,
  });
  await newUser.save();
};
