import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { RedisService } from '@midwayjs/redis';
import { SystemInfoService } from './system';
import { ContestRankModel } from '../model/contest/contestRank';
import { ContestService } from './contest';

@Provide()
export class ContestRankService {
  @InjectEntityModel(ContestRankModel)
  contestRankModel: ReturnModelType<typeof ContestRankModel>;

  @Inject()
  redisService: RedisService;

  @Inject()
  systemInfoService: SystemInfoService;

  @Inject()
  contestService: ContestService;

  async updateRankBySubmission(submission) {
    const {
      uid: userId,
      contestId,
      problemNumber,
      createTime,
      result,
      _id: submissionId,
      username,
    } = submission;
    if (result.error === 'Compile Error') return; // CE不计算
    const lastRank = await this.contestRankModel.findOneAndUpdate(
      {
        contestId,
        userId,
      },
      {
        contestId,
        userId,
      },
      {
        upsert: true,
        new: true,
      }
    );

    const contest = await this.contestService.listOne(contestId);
    // 更新提交记录
    let list = null;
    if (!lastRank.list || !lastRank.list.length) {
      list = [];
      for (let i = 0; i < contest.problemList.length; i++) {
        list.push({
          wrongCount: 0,
          submissionId: undefined,
          pass: false,
          solvedTime: 0,
          maxSolvedPercent: 0,
          score: 0,
        });
      }
    } else list = lastRank.list;

    const item = list[problemNumber - 1];
    if (result.error && item.pass === false) {
      item.wrongCount++;
    } else if (item.pass === false) {
      item.pass = true;
      item.solvedTime = createTime - contest.beginTime;
      item.maxSolvedPercent = Number(
        ((100 * result.totalCorrect) / result.totalCount).toFixed(2)
      );
      item.score = contest.problemList[problemNumber - 1].score;
    }
    item.submissionId = submissionId;

    let totalSolved = 0;
    let totalWrong = 0;
    let totalTime = 0;
    let totalScore = 0;
    list.forEach(e => {
      totalSolved += Number(e.pass);
      totalWrong += e.wrongCount;
      totalTime += e.solvedTime;
      totalScore += e.score;
    });
    lastRank.totalSolved = totalSolved;
    lastRank.totalWrong = totalWrong;
    lastRank.totalTime = totalTime + totalWrong * 5 * 60000; // 罚时五分钟
    lastRank.totalScore = totalScore;
    lastRank.updateTime = createTime;
    lastRank.list = list;
    lastRank.username = username;
    await this.contestRankModel.updateOne(
      {
        contestId,
        userId,
      },
      lastRank
    );
  }

  async listByContestId(id: number) {
    return this.contestRankModel.find({ contestId: id }, { _id: 0, __v: 0 });
  }
}
