import { prop } from '@typegoose/typegoose';
import { EntityModel } from '@midwayjs/typegoose';
import { Rule, RuleType } from '@midwayjs/decorator';

@EntityModel()
export class JudgeModel {
  @prop()
  public active: boolean;

  @prop()
  @Rule(RuleType.string().required().min(1))
  public judgeURL: string;

  @prop()
  public createTime: number;

  @prop()
  public updateTime: number;
}
