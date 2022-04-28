import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { RedisService } from '@midwayjs/redis';
import { ContestDTO, ContestModel } from '../model/contest/contest';
import { SystemInfoService } from './system';

@Provide()
export class ContestService {
  @InjectEntityModel(ContestModel)
  contestModel: ReturnModelType<typeof ContestModel>;

  @Inject()
  redisService: RedisService;

  @Inject()
  systemInfoService: SystemInfoService;

  async add(contestBasic: ContestDTO) {
    const data = contestBasic as ContestModel;
    const count = await this.systemInfoService.getContestTotal();
    // 设置新添加的比赛编号
    data.id = count + 1;
    data.createTime = Date.now();
    data.updateTime = Date.now();
    return this.contestModel.create(data);
  }

  async listAll() {
    return this.contestModel.find({}, { problemList: 0, _id: 0, __v: 0 });
  }

  async listOne(id: number) {
    return this.contestModel.findOne(
      { id },
      { _id: 0, __v: 0, 'problemList._id': 0 }
    );
  }

  async update(id: number, data: any) {
    data.id && delete data.id;
    return this.contestModel.updateOne({ id }, data);
  }

  async delete(id: number) {
    return this.contestModel.deleteOne({ id });
  }
}
