import mongoose from "mongoose";

export const connectMongodbDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log(`[Info] Mongo Server Running On ${mongoose.connection.host}`);
  } catch (error) {
    console.log(`[Error] Error while connected to database ${error}`);
  }
};
