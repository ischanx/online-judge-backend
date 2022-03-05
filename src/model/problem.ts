import { prop } from '@typegoose/typegoose';
import { EntityModel } from '@midwayjs/typegoose';
import { Rule, RuleType } from '@midwayjs/decorator';

class Sample {
  @prop()
  @Rule(RuleType.string().required())
  public type: string;

  @prop()
  @Rule(RuleType.string().required())
  public input: string;

  @prop()
  @Rule(RuleType.string().required())
  public output: string;
}

export class ProblemDTO {
  @prop()
  @Rule(RuleType.string().required().min(1).max(20))
  public title: string;

  @prop()
  @Rule(RuleType.string().required().min(1))
  public content: string;

  @prop({ type: () => Sample })
  @Rule(Sample)
  public samples: Sample[];

  @prop()
  @Rule(RuleType.number().required().min(1000).max(10000))
  public compileTime: number;

  @prop()
  @Rule(RuleType.number().required().min(10000).max(1000000))
  public compileMemory: number;

  @prop()
  @Rule(RuleType.number().required().min(100).max(10000))
  public executeTime: number;

  @prop()
  @Rule(RuleType.number().required().min(10000).max(1000000))
  public executeMemory: number;

  @prop()
  @Rule(RuleType.number().required().min(10000).max(1000000))
  public fileSize: number;

  @prop()
  @Rule(RuleType.string())
  public example?: string;
}

@EntityModel()
export class ProblemModel extends ProblemDTO {
  @prop()
  public id: number;

  @prop()
  public createTime: number;

  @prop()
  public updateTime: number;

  @prop()
  public number: string;
}

export class UpdateDTO {
  @Rule(RuleType.number().required())
  id: number;

  @Rule(ProblemDTO)
  data: ProblemDTO;
}

export class DeleteDTO {
  @Rule(RuleType.number().required())
  id: number;
}

export class QueryByProblemIdDTO {
  @Rule(RuleType.number().required())
  id: number;
}
