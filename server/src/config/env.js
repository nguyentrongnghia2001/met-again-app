import dotenv from "dotenv";

dotenv.config();

const splitOrigins = (value) =>
  value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? ["http://localhost:5173"];

export const env = {
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/met_again",
  clientOrigins: splitOrigins(process.env.CLIENT_ORIGIN),
};
