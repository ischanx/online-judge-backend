import { prop } from '@typegoose/typegoose';
import { EntityModel } from '@midwayjs/typegoose';

class Sample {
  @prop()
  public type: string;

  @prop()
  public input: string;

  @prop()
  public output: string;
}

@EntityModel()
export class ProblemModel {
  @prop()
  public title: string;

  @prop()
  public id: string;

  @prop()
  public content: string;

  @prop({ type: () => Sample })
  public samples?: Sample[];
}
