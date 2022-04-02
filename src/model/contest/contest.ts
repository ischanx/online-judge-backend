import { prop } from '@typegoose/typegoose';
import { EntityModel } from '@midwayjs/typegoose';
import { Rule, RuleType } from '@midwayjs/decorator';

class ContestProblem {
  @prop()
  @Rule(RuleType.number().required())
  public id: number;

  @prop()
  @Rule(RuleType.string().required())
  public title: string;

  @prop()
  @Rule(RuleType.number().required())
  public score: number;
}

export class ContestDTO {
  @prop()
  @Rule(RuleType.string().required())
  public title: string;

  @prop()
  @Rule(RuleType.string().required())
  public description: string;

  @prop()
  @Rule(RuleType.number().required())
  public beginTime: number;

  @prop()
  @Rule(RuleType.number().required())
  public endTime: number;

  @prop({ type: () => ContestProblem })
  @Rule(ContestProblem)
  public problemList: ContestProblem[];
}

@EntityModel()
export class ContestModel extends ContestDTO {
  @prop()
  @Rule(RuleType.number().required())
  public id: number;

  @prop()
  public createTime: number;

  @prop()
  public updateTime: number;
}

export class GetContestProblemDTO {
  @Rule(RuleType.number().required())
  public contestId: number;

  @Rule(RuleType.number().required())
  public problemNumber: number;
}
