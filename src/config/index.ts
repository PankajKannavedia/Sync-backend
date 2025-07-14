import { config } from "dotenv";
import ip from "ip";
config();

export const CREDENTIALS = process.env.CREDENTIALS === "true";
export const IP = ip.address(`public`, `ipv4`);

export const {
  NODE_ENV,
  BASE_URL,
  PORT,
  PORT_HTTP,
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_PORT,
  DB_URL,
  DB_DATABASE,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
} = process.env;
