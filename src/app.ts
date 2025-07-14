import cors from "cors";
import express from "express";
import { connect, set } from "mongoose";
import { NODE_ENV, PORT_HTTP, ORIGIN, CREDENTIALS } from "@/config";
import { dbConnection } from "@/databases";
import { Routes } from "@/interfaces/routes.interface";
import { logger } from "@/utils/logger";
import { listen } from "@colyseus/arena";
import arenaConfig from "./arena.config";
import { monitor } from "@colyseus/monitor";
import http from "http";

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || "development";
    this.port = PORT_HTTP || 3000;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.colyseusListen();
    this.colyseusMonitor();
  }

  public listen() {
    const server = http.createServer(this.app);
    server.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private colyseusMonitor() {
    this.app.use("/colyseus", monitor());
  }

  private colyseusListen() {
    listen(arenaConfig);
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
    const whitelist = ORIGIN ? ORIGIN.split(",").map((o) => o.trim()) : [];

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
        credentials: CREDENTIALS,
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
