import { IUser, IUserDocument, userModel } from "../../../models/user-model";
import { AUTH_EXCEPTION } from "../../../utils/constants";
import { NotFoundException } from "../../../utils/error-exceptions";

interface IUserToken {
  loginUser: IUserDocument;
  longLivedToken: string;
  expiresAt: number;
}

export const findUserByEmail = async (email: string) => {
  const user = await userModel.findOne({ email });

  if (!user) {
    throw new NotFoundException(AUTH_EXCEPTION.NOTFOUND.EMAIL);
  }
  return user;
};

export const checkAlreadyRegistered = async (email: string) => {
  const user = await userModel.findOne({ email });
  return user;
};

export const addNewUser = async (payload: IUser) => {
  const newUser = new userModel({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    profile_picture: payload.profile_picture,
    login_type: payload.login_type,
  });
  await newUser.save();
};

export const saveTokenInfoInDB = async (payload: IUserToken) => {
  payload.loginUser.refresh_token = payload.longLivedToken;
  payload.loginUser.refresh_token_expiry = payload.expiresAt;
  await payload.loginUser.save();
};

export const addNewFacebookUser = async (payload: IUser) => {
  const newUser = new userModel({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    profile_picture: payload.profile_picture,
    login_type: payload.login_type,
    refresh_token: payload.refresh_token,
    refresh_token_expiry: payload.refresh_token_expiry,
  });
  await newUser.save();
};
