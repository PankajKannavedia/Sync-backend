import App from "./app";
import validateEnv from "./utils/validateEnv";
import GalleryRoute from "./routes/gallery.route";
import { logger } from "./utils/logger";

// Validate environment variables
validateEnv();

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Initialize and start the application
const app = new App([new GalleryRoute()]);
app.listen();
