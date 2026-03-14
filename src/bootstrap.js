import express from "express";
import { PORT } from "../config/config.service.js";
import connectDB from "./DB/config/db.connection.js";
import authRouter from "./modules/auth/auth.controller.js";
import cors from "cors";
import router from "./modules/userModule/user.controller.js";
import { connectRedis } from "./DB/config/redis.connections.js";

const Bootstrap = async () => {
  const app = express();
  // middlewares

  app.use(express.json());
  app.use(cors());
  app.use("/auth", authRouter);
  app.use("/users", router);
  //this is used to get pictures by ther path
  app.use("/uploads", express.static("./uploads"));

  //const jwtSecretGenrator = crypto.randomBytes(64).toString("hex"); // JWT
  //const encryptionKeyGenrator = crypto.randomBytes(32).toString("hex"); // AES-256

  await connectDB();
  await connectRedis();
  //invalid routing
  app.use("{/dummy}", (req, res) => {
    return res.status(404).json({ message: "invalid path" });
  });

  // error handling
  app.use((error, req, res, next) => {
    return res.status(error.status || 500).json({
      message: error.message || "Something went wrong",
      errors: error.validationErrors || error.stack || null,
    });
  });
  app.listen(PORT, () => console.log("app running on port " + PORT));
};
export default Bootstrap;
