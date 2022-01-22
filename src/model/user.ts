import { prop } from '@typegoose/typegoose';
import { EntityModel } from '@midwayjs/typegoose';

@EntityModel()
export class UserModel {
  @prop()
  public username: string;

  @prop()
  public password: string;

  @prop()
  public email: string;

  @prop()
  public emailCode: string;

  @prop()
  public status: number;

  @prop()
  public loginTime: Date;

  @prop()
  public registerTime: Date;

  @prop()
  public nickname?: string;

  @prop()
  public permission?: string;
}
