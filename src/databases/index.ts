import { DB_HOST, DB_PORT, DB_DATABASE, DB_URL } from "../config";

const isLocalDB = DB_HOST === "localhost" || DB_HOST === "127.0.0.1";

export const dbConnection = isLocalDB
  ? `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`
  : DB_URL;
