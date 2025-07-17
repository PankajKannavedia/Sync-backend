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
      return cb(new Error("Only .glb files are allowed"), null);
    }

    createDirectoryIfNotExists(storePath);
    cb(null, storePath);
  },
  filename: (req, file, cb) => {
    const lastIndex = file.originalname.lastIndexOf(".");
    const fileName = file.originalname.slice(0, lastIndex);
    const extension = file.originalname.slice(lastIndex + 1);
    const finalFileName = `${fileName}.${extension}`;
    console.log("Uploading file:", finalFileName);
    cb(null, finalFileName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith(".glb")) {
      cb(null, true);
    } else {
      //@ts-ignore
      cb(new Error("Only .glb files are allowed"), false);
    }
  },
  limits: {
    fileSize: 3000 * 1024 * 1024, // 50MB limit
  },
});

class GalleryRoute extends BaseRoute {
  public path = "/gallery";
  public router = Router();
  public galleryController = new GalleryController();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Upload multiple .glb files
    this.router.post(
      `${this.path}/upload`,
      upload.array("glbFiles", 10),
      this.galleryController.createModel
    );

    // Get all gallery files
    this.router.get(`${this.path}`, this.galleryController.getAllFiles);

    // Download specific file by subject name
    this.router.get(
      `${this.path}/download/:subjectName`,
      this.galleryController.fileByName
    );
  }
}

export default GalleryRoute;
