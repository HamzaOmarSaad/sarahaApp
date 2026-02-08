//in config/config.service.js
import { config } from "dotenv";
import { resolve } from "node:path";

const NODE_ENV = process.env.NODE_ENV;
const envPathes = {
  devolpment: ".env.devlopment",
  production: ".env.production",
};
config({ path: resolve(`./config/${envPathes[NODE_ENV]}`) });

export const PORT = process.env.PORT || 3000;

export const DB_HOST = process.env.PORT || "127.0.0.1";

export const DB_PORT = parseInt(process.env.PORT) || 3306;
