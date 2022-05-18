import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { RedisService } from '@midwayjs/redis';
import { ContestSubmissionModel } from '../model/contest/contestSubmission';
import { ContestRankService } from './rank';
import { getCurrentTimestamp } from '../utils/generate';
const mongoose = require('mongoose');

@Provide()
export class ContestSubmissionsService {
  @InjectEntityModel(ContestSubmissionModel)
  contestSubmissionModel: ReturnModelType<typeof ContestSubmissionModel>;

  @Inject()
  redisService: RedisService;

  @Inject()
  rankService: ContestRankService;

  async submit(obj) {
    obj.createTime = getCurrentTimestamp();
    return await this.contestSubmissionModel.create(obj);
  }

  async updateBySubmissionId(id, obj) {
    obj.updateTime = getCurrentTimestamp();
    const updateRes = await this.contestSubmissionModel.findOneAndUpdate(
      { _id: id },
      obj,
      {
        new: true,
      }
    );
    await this.rankService.updateRankBySubmission(updateRes);
    return;
  }

  async list() {
    return this.contestSubmissionModel.find({}, { code: 0, log: 0 });
  }

  async getBySubmissionId(id) {
    return this.contestSubmissionModel.findOne({ _id: id });
  }

  async listUserSubmissionByProblemNumber({
    userId,
    problemNumber,
    contestId,
  }) {
    return this.contestSubmissionModel.find(
      { uid: mongoose.Types.ObjectId(userId), problemNumber, contestId },
      { code: 0, log: 0 }
    );
  }
}
