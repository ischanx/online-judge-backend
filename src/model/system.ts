import { prop } from '@typegoose/typegoose';
import { EntityModel } from '@midwayjs/typegoose';

@EntityModel()
export class SystemInfoModel {
  @prop()
  public _id: string;

  @prop()
  public value: number;
}
