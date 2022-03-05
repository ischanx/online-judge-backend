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
  @Rule(RuleType.string())
  public error: string;

  @prop()
  @Rule(RuleType.string().required())
  public message: string;

  @prop()
  @Rule(RuleType.number())
  public time: number;

  @prop()
  @Rule(RuleType.number())
  public memory: number;

  @prop()
  @Rule(RuleType.number())
  public startTime: number;

  @prop()
  @Rule(RuleType.number())
  public endTime: number;

  @prop()
  @Rule(RuleType.number())
  public realTime: number;

  @prop()
  @Rule(RuleType.string())
  public compareDetail: string;

  @prop()
  @Rule(RuleType.boolean())
  public pass: boolean;

  @prop()
  @Rule(RuleType.string())
  public stdout: string;

  @prop()
  @Rule(RuleType.number())
  public totalCorrect: number;

  @prop()
  @Rule(RuleType.number())
  public totalCount: number;
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

  // @prop()
  // public stdin: string;

  // @prop()
  // public expectedStdout?: string;

  @prop()
  public log: string;
}

export class getBySubmissionIdDTO {
  @Rule(RuleType.string().required().length(24).hex())
  id: string;
}

export class updateBySubmissionIdDTO {
  @Rule(RuleType.string().required().length(24).hex())
  submissionId: string;

  @Rule(JudgeModel)
  result: JudgeModel;

  @Rule(RuleType.string().required())
  log: string;
}