import express from "express";
import { PORT } from "../config/config.service.js";
import connectDB from "./DB/config/db.connection.js";
import authRouter from "./modules/auth/auth.controller.js";
import cors from "cors";
import crypto from "crypto";

const Bootstrap = async () => {
  const app = express();
  // middlewares

  app.use(express.json());
  app.use(cors());
  app.use("/auth", authRouter);

  //const jwtSecretGenrator = crypto.randomBytes(64).toString("hex"); // JWT
  //const encryptionKeyGenrator = crypto.randomBytes(32).toString("hex"); // AES-256

  await connectDB();
  //invalid routing
  app.use("{/dummy}", (req, res) => {
    return res.status(404).json({ message: "invalid path" });
  });

  // error handling
  app.use((error, reg, res, next) => {
    return res.status(error?.cause?.status || 500).json({
      message: "somthing went wrong " + error.message,
    });
  });
  app.listen(PORT, () => console.log("app running on port " + PORT));
};
export default Bootstrap;
