import GalleryModel from "@/models/gallery.model";
import BaseService from "./base.service";
import { HttpException } from "@/exceptions/HttpException";
import { getFileHash } from "@/utils/util";

class GalleryService extends BaseService {
  public model = GalleryModel;
  public async loadAssetByName(subjectName: string): Promise<any> {
    console.log("Here122");
    const findAsset = await this.model.find({ subjectName: subjectName });
    if (!findAsset) throw new HttpException(409, "Asset doesn't exist");

    return findAsset[0];
  }

  public async loadAssets(): Promise<any> {
    const findAsset = await this.model.find();
    if (!findAsset) throw new HttpException(409, "Asset doesn't exist");
    return findAsset;
  }

  public async postAsset(req, res, next): Promise<any> {
    const data = req.files;
    if (!data) throw new HttpException(409, "data doesn't exist");

    try {
      const modelToSave: any[] = [];
      const dupFiles: any[] = [];
      let index = 0;
      for await (const file of data) {
        index = index + 1;
        const fileHashData = await getFileHash({
          fileData: { name: file.filename, path: file.path },
        });

        // Check if file hash data already exist
        const fileData = await GalleryModel.findOne({
          subjectName: fileHashData.name,
        });

        if (fileData && fileData.hash != fileHashData.hash && file.isGlb) {
          modelToSave.push(
            new GalleryModel({
              subjectName: file.filename,
              subject3DUrl: `gallery/${file.filename}`,
              index: index,
              hash: fileHashData.hash,
            })
          );
        } else if (!fileData && fileHashData.hash && file.isGlb) {
          modelToSave.push(
            new GalleryModel({
              subjectName: file.filename,
              subject3DUrl: `gallery/${file.filename}`,
              index: index,
              hash: fileHashData.hash,
            })
          );
        } else if (fileData && fileData.hash == fileHashData.hash) {
          dupFiles.push(fileData);
        }
      }

      const bulkDAta = await GalleryModel.bulkSave(modelToSave);
      if (bulkDAta) {
        await Promise.all(modelToSave).then(() =>
          res.send({
            success: modelToSave,
            failed: dupFiles,
            message: "created",
          })
        );
      }
    } catch (error) {
      next(error);
    }
  }
}

export default GalleryService;
