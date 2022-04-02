import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { RedisService } from '@midwayjs/redis';
import { SystemInfoModel } from '../model/system';

@Provide()
export class SystemInfoService {
  @InjectEntityModel(SystemInfoModel)
  systemInfoModel: ReturnModelType<typeof SystemInfoModel>;

  @Inject()
  redisService: RedisService;

  async getNextSequenceValue(key: string): Promise<number> {
    const document = await this.systemInfoModel.findOneAndUpdate(
      { _id: key },
      { $inc: { value: 1 } },
      {
        upsert: true,
        new: false,
      }
    );
    return document ? document.value : 0;
  }

  async getProblemTotal() {
    return this.getNextSequenceValue('ADD_PROBLEM_TOTAL');
  }

  async getContestTotal() {
    return this.getNextSequenceValue('ADD_CONTEST_TOTAL');
  }
}
