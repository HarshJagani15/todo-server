import { userModel } from "../../../models/user-model";

interface IUpdateUserName {
  email: string;
  name: string;
}

export const updateUserName = async (payload: IUpdateUserName) => {
  const user = await userModel.findOneAndUpdate(
    { email: payload.email },
    { $set: { name: payload.name } },
    { new: true }
  );
  return user;
};
