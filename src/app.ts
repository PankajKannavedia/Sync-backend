import cors from "cors";
import express from "express";
import { connect, set } from "mongoose";
import { ENV } from "./config/index";
import { dbConnection } from "./databases";
import { Routes } from "./interfaces/routes.interface";
import arenaConfig from "./arena.config";
import { listen as arenaListen } from "@colyseus/arena";
import { logger } from "./utils/logger";
import http from "http";

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = ENV.NODE_ENV || "development";
    this.port = ENV.PORT_HTTP || 3000;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
  }

  public listen() {
    /* ---------- 1. Express on PORT_HTTP ---------- */
    const server = http.createServer(this.app);
    server.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });

    /* ---------- 2. Colyseus / Arena on PORT_WS ---------- */
    arenaListen(arenaConfig, ENV.PORT_WS);
    logger.info(`🎮 WS  listening on ${ENV.PORT_WS}`);
  }

  public getServer() {
    return this.app;
  }

  private async connectToDatabase() {
    if (this.env !== "production") {
      set("debug", true);
    }

    try {
      await connect(dbConnection);
      console.log("✅ Connected to MongoDB");
    } catch (err) {
      console.error("❌ MongoDB connection failed:", err.message);
      process.exit(1);
    }
  }

  private initializeMiddlewares() {
    const whitelist = ENV.ORIGIN
      ? ENV.ORIGIN.split(",").map((o) => o.trim())
      : [];

    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) return callback(null, true); // Postman etc.

          const allowed =
            whitelist.includes(origin) || origin.includes(".ngrok-free.app");

          return allowed
            ? callback(null, true)
            : callback(new Error("Not allowed by CORS"));
        },
        credentials: ENV.CREDENTIALS,
      })
    );

    this.app.use(express.json());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }
}

export default App;
