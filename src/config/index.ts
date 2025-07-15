import { config as loadEnv } from "dotenv";
import ip from "ip";
loadEnv();

export const IP = ip.address(`public`, `ipv4`);

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT_HTTP || 3000),
  DB_USER: process.env.DB_USER || "",
  DB_PASS: process.env.DB_PASS || "",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || "27017",
  DB_DATABASE: process.env.DB_DATABASE || "syncspace-local",
  LOG_FORMAT: process.env.LOG_FORMAT || "dev",
  LOG_DIR: process.env.LOG_DIR || "logs",
  BASE_URL: process.env.BASE_URL || "http://localhost",
  DB_URL: process.env.DB_URL,
  SECRET_KEY: process.env.SECRET_KEY,
  ORIGIN: process.env.ORIGIN || "http://localhost:4200",
  CREDENTIALS: process.env.CREDENTIALS === "true",
};
