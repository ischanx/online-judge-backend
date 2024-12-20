import { prop } from '@typegoose/typegoose';
import { EntityModel } from '@midwayjs/typegoose';
import { Rule, RuleType } from '@midwayjs/decorator';

class File {
  @prop()
  public name: string;
  @prop()
  public size: number;
  @prop()
  public md5: string;
}
class Sample {
  @prop()
  public input: File;

  @prop()
  public output: File;
}

export class ProblemDTO {
  @prop()
  @Rule(RuleType.string().required().min(1).max(20))
  public title: string;

  @prop()
  @Rule(RuleType.string().required().min(1))
  public content: string;

  // @prop({ type: () => Sample })
  // @Rule(Sample)
  // public samples: Sample[];

  @prop()
  @Rule(RuleType.string().required().min(1))
  public samplesFile: string;

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

  @prop()
  @Rule(RuleType.number().required())
  public difficulty: number;
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

  @prop({ type: () => Sample })
  public samples: Sample[];

  @prop()
  public totalSubmit: number;

  @prop()
  public errorSubmit: number;
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
