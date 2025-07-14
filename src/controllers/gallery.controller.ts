import GalleryService from "../services/gallery.service";
import { logger } from "../utils/logger";
import { NextFunction, Request, Response } from "express";
import path from "path";

class GalleryController {
  service = new GalleryService();
  public getAllFiles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const responseData: any = await this.service.loadAssets();

      res.status(201).json({ data: responseData, message: "created" });
    } catch (error) {
      next(error);
    }
  };

  public fileByName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const subjectName = req.params.subjectName;
      logger.info(subjectName);

      const models: any = await this.service.loadAssetByName(subjectName);
      const joinedPath = path.join(
        "./src/asset_3d/gallery/",
        models.subjectName
      );
      res.set(`Cache-Control`, `no-transform`);

      res.download(joinedPath, function (err) {
        if (err) {
          next(err);
        } else {
          console.log("Sent:", joinedPath);
          next();
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public createModel = async (req, res, next) => {
    try {
      const responseData = await this.service.postAsset(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export default GalleryController;
