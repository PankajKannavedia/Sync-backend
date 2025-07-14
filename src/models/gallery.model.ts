import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'file', timestamps: true } })
class Gallery {
  @prop({  type: String, required: true })
  public subjectName: string;
  @prop({  type: String, required: true })
  public subject3DUrl:string;
  @prop({ type: String, required: true})
  public hash: string;
  public xray : string[];
  public show : string[];
  public mr : boolean;
  public xrayDisable : string[];
  @prop({ required: true })
  public index : number;
}

const GalleryModel = getModelForClass(Gallery);
GalleryModel.schema.index({ hash: 1 }, { unique: true });
GalleryModel.ensureIndexes();
export default GalleryModel;