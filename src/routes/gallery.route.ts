import GalleryController from "../controllers/gallery.controller";
import { Router } from "express";
import multer from "multer";
import { createDirectoryIfNotExists } from "../utils/util";
import path from "path";
import BaseRoute from "./base.route";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let storePath = path.join(__dirname, `../asset_3d/gallery`);

    const isGlb = file.originalname.endsWith(".glb");

    if (isGlb) {
      //@ts-ignore
      file.isGlb = true;
    } else {
      return;
    }

    createDirectoryIfNotExists(storePath);

    cb(null, storePath);
  },
  filename: (req, file, cb) => {
    const lastIndex = file.originalname.lastIndexOf(".");
    const fileName = file.originalname.slice(0, lastIndex);
    const extension = file.originalname.slice(lastIndex + 1);
    const finalFileName = `${fileName}.${extension}`;
    console.log(finalFileName);
    cb(null, finalFileName, fileName);
  },
});

const upload = multer({ storage });

class GalleryRoute extends BaseRoute {
  public path = "/gallery";
  public router = Router();
  public galleryController = new GalleryController();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}`,
      upload.array("glbFiles", 10),
      this.galleryController.createModel
    );
    this.router.get(`${this.path}`, this.galleryController.getAllFiles);
    this.router.get(
      `${this.path}/:subjectName`,
      this.galleryController.fileByName
    );
  }
}

export default GalleryRoute;
