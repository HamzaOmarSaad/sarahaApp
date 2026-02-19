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

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
