import { createClient } from "redis";
import { errorHandle } from "../../utils/resHandler.js";
import { REDIS_DB_NAME, REDIS_DB_URI } from "../../../config/config.service.js";

export const redisClient = createClient({
  url: REDIS_DB_URI,
  database: REDIS_DB_NAME,
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("🚀redis Connected successfully");
  } catch (error) {
    throw errorHandle({ message: "error connecting to redis" });
  }
};
