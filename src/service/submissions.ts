import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { RedisService } from '@midwayjs/redis';
import { SubmissionModel } from '../model/submission';

@Provide()
export class SubmissionsService {
  @InjectEntityModel(SubmissionModel)
  submissionModel: ReturnModelType<typeof SubmissionModel>;

  @Inject()
  redisService: RedisService;

  async submit(obj) {
    obj.createTime = Date.now();
    return await this.submissionModel.create(obj);
  }

  async updateBySubmissionId(id, obj) {
    obj.updateTime = Date.now();
    return this.submissionModel.updateOne({ _id: id }, obj);
  }

  async list() {
    return this.submissionModel.find();
  }

  async getBySubmissionId(id) {
    return this.submissionModel.findOne({ _id: id });
  }
}
