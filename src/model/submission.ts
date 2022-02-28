import { prop, Ref } from '@typegoose/typegoose';
import { EntityModel } from '@midwayjs/typegoose';
import { UserModel } from './user';
import { ProblemModel } from './problem';
import { Rule, RuleType } from '@midwayjs/decorator';

export class SubmissionDTO {
  @prop({ ref: () => ProblemModel })
  @Rule(RuleType.string().required().length(24).hex())
  public problemId: Ref<ProblemModel>;

  @prop()
  @Rule(RuleType.string().required().min(1).max(10000))
  public code: string;

  @prop()
  @Rule(RuleType.string().required())
  public lang: string;
}

class JudgeModel {
  @prop()
  public memory: number;

  @prop()
  public time: number;

  @prop()
  public stdin: string;

  @prop()
  public stdout: string;

  // @prop()
  // public expectedStdout?: string;

  @prop()
  public stderr: string;

  @prop()
  public pass: boolean;
}

@EntityModel()
export class SubmissionModel extends SubmissionDTO {
  @prop()
  @Rule(RuleType.string().required().max(5))
  public problemNumber: string;

  @prop()
  @Rule(RuleType.string().required().min(1).max(20))
  public problemTitle: string;

  @prop({ ref: () => UserModel })
  @Rule(RuleType.string().required().length(24).hex())
  public uid: Ref<UserModel>;

  @prop()
  public username: string;

  @prop()
  public createTime: number;

  @prop()
  public updateTime: number;

  @prop()
  public status: string;

  @prop({ type: () => JudgeModel })
  public result?: JudgeModel;

  @prop()
  public runInfo: string;
}

export class getBySubmissionIdDTO {
  @Rule(RuleType.string().required().length(24).hex())
  id: string;
}
