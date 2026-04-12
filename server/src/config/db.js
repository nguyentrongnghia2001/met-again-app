import mongoose from "mongoose";

export const connectDatabase = async (mongoUri) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};
