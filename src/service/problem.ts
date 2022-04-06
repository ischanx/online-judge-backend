import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { ProblemDTO, ProblemModel } from '../model/problem';
import { RedisService } from '@midwayjs/redis';
import { SystemInfoService } from './system';
import { FileService } from './file';

@Provide()
export class ProblemService {
  @InjectEntityModel(ProblemModel)
  problemModel: ReturnModelType<typeof ProblemModel>;

  @Inject()
  redisService: RedisService;

  @Inject()
  systemInfoService: SystemInfoService;

  @Inject()
  fileService: FileService;

  async add(problemBasic) {
    const problemData = problemBasic as ProblemModel;
    // 系统添加过的题目的数量
    const count = await this.systemInfoService.getProblemTotal();
    // 设置新添加的题目编号
    problemData.id = count + 1;
    problemData.createTime = Date.now();
    problemData.updateTime = Date.now();
    const computeResStr: any = await this.redisService.get(
      problemData.samplesFile
    );
    const computeRes = JSON.parse(computeResStr);
    problemData.samples = computeRes.samples;
    await this.fileService.moveSample(
      computeRes.dirName,
      String(problemData.id)
    );
    return await this.problemModel.create(problemData);
  }

  async updateByProblemId(id, obj: ProblemDTO) {
    const problemData = obj as ProblemModel;
    problemData.updateTime = Date.now();
    return this.problemModel.updateOne({ id: id }, problemData);
  }

  async queryAll() {
    return this.problemModel.find({}, { _id: 0, __v: 0, samples: 0 });
  }

  async queryByProblemId(problemId: number) {
    const res = await this.problemModel.findOne({
      id: problemId,
    });
    return res;
  }

  async deleteByProblemId(problemId: number) {
    return this.problemModel.findOneAndDelete({
      id: problemId,
    });
  }
}
