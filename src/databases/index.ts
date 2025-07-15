import { ENV } from "../config/index";

const isLocalDB = ENV.DB_HOST === "localhost" || ENV.DB_HOST === "127.0.0.1";

export const dbConnection = isLocalDB
  ? `mongodb://${ENV.DB_HOST}:${ENV.DB_PORT}/${ENV.DB_DATABASE}`
  : ENV.DB_URL;
