import App from "./app";
import validateEnv from "./utils/validateEnv";
import GalleryRoute from "./routes/gallery.route";
validateEnv();

const app = new App([ new GalleryRoute()]);

app.listen();
