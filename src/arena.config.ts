import { monitor } from "@colyseus/monitor";
import { HoloRoom } from "./rooms/HoloRoom";
import Arena from "@colyseus/arena";
import express from "express";
import { ENV } from "config/index";

export default Arena({
  getId: () => "HoloCollab",

  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define("lobby_room", HoloRoom);
  },

  initializeExpress: (app) => {
    // Body parser - reads data from request body into json object
    app.use(express.json());
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));

    /**
     * Bind @colyseus/monitor
     * It is recommended to protect this route with a password.
     * Read more: https://docs.colyseus.io/tools/monitor/
     */
    app.use("/colyseus", monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
    console.log(`Server will listen on ${ENV.PORT_HTTP}`);
  },
});
