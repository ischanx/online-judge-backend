import { prop } from '@typegoose/typegoose';
import { EntityModel } from '@midwayjs/typegoose';
export class RankSubmission {
  @prop()
  public wrongCount: number;

  @prop()
  public submissionId: number;

  @prop()
  public pass: boolean;

  @prop()
  public solvedTime: number;

  @prop()
  public maxSolvedPercent: number;

  @prop()
  public score: number;
}
@EntityModel()
export class ContestRankModel {
  @prop()
  public userId: string;

  @prop()
  public contestId: number;

  @prop()
  public totalSolved: number;

  @prop()
  public totalWrong: number;

  @prop()
  public totalTime: number;

  @prop()
  public totalScore: number;

  @prop()
  public updateTime: number;

  @prop({ type: () => RankSubmission })
  public list: RankSubmission[];
}
