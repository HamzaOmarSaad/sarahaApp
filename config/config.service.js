import { config } from "dotenv";
import { resolve } from "node:path";

const NODE_ENV = process.env.NODE_ENV;
const envPathes = {
  development: ".env.development",
  production: ".env.production",
};
const env = envPathes[NODE_ENV];
config({ path: resolve(`./config/${env}`) });

export const PORT = process.env.PORT || 3000;

export const DB_URI = process.env.DB_URI;
