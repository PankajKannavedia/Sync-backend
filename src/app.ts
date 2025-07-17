import cors from "cors";
import express from "express";
import { connect, set } from "mongoose";
import { ENV } from "./config/index";
import { dbConnection } from "./databases";
import { Routes } from "./interfaces/routes.interface";
import arenaConfig from "./arena.config";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { logger } from "./utils/logger";
import http from "http";
import { matchMaker } from "@colyseus/core";

class App {
  private readonly app = express();
  private readonly port = ENV.PORT;
  private readonly env = ENV.NODE_ENV;

  constructor(routes: Routes[]) {
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
  }

  public async listen() {
    /* 1️⃣ create ONE http server */
    const server = http.createServer(this.app);

    /* 2️⃣ setup Colyseus transport using the SAME server */
    const transport = new WebSocketTransport({ server: server });

    /* 3️⃣ build Colyseus GameServer from Arena config */
    const gameServer = new Server({ transport });
    await arenaConfig.initializeGameServer?.(gameServer);
    await arenaConfig.initializeExpress?.(this.app);
    await arenaConfig.beforeListen?.();

    server.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`🌐 API + 🚀 WS listening on ${this.port} (${this.env})`);
      logger.info(`=================================`);
    });
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

    this.app.get("/matchmake/lobby_room", async (req, res) => {
      const rooms = await matchMaker.query({ name: "lobby_room" });
      res.json(rooms);
    });
  }
}

export default App;
