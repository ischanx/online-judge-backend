import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { RedisService } from '@midwayjs/redis';
import { SubmissionModel } from '../model/submission';
import { getCurrentTimestamp } from '../utils/generate';
const mongoose = require('mongoose');

@Provide()
export class SubmissionsService {
  @InjectEntityModel(SubmissionModel)
  submissionModel: ReturnModelType<typeof SubmissionModel>;

  @Inject()
  redisService: RedisService;

  async submit(obj) {
    obj.createTime = getCurrentTimestamp();
    return await this.submissionModel.create(obj);
  }

  async updateBySubmissionId(id, obj) {
    obj.updateTime = getCurrentTimestamp();
    return this.submissionModel.findOneAndUpdate({ _id: id }, obj);
  }

  async list() {
    return this.submissionModel
      .find({ status: 'success' }, { code: 0, log: 0 })
      .sort({ createTime: -1 });
  }

  async listUserSubmissionByProblemId({ userId, problemId }) {
    return this.submissionModel.find(
      { uid: mongoose.Types.ObjectId(userId), problemId },
      { code: 0, log: 0 }
    );
  }

  async getBySubmissionId(id) {
    return this.submissionModel.findOne({ _id: id });
  }

  async getByUsername(username) {
    return this.submissionModel.find({ username });
  }
}
