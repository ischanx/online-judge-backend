import { EntityModel } from '@midwayjs/typegoose';
import { prop } from '@typegoose/typegoose';
import { Rule, RuleType } from '@midwayjs/decorator';
import { SubmissionModel } from '../submission';

@EntityModel()
export class ContestSubmissionModel extends SubmissionModel {
  @prop()
  @Rule(RuleType.number().required())
  public contestId: number;

  @prop()
  @Rule(RuleType.number().required())
  public problemNumber: number;
}
