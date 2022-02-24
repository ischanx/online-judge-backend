import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { ProblemDTO, ProblemModel } from '../model/problem';
import { RedisService } from '@midwayjs/redis';

@Provide()
export class ProblemService {
  @InjectEntityModel(ProblemModel)
  problemModel: ReturnModelType<typeof ProblemModel>;

  @Inject()
  redisService: RedisService;

  async add(problemBasic) {
    const problemData = problemBasic as ProblemModel;
    // 题目编号的偏移量
    const offset = 1000;
    // 当前题目的数量
    const count = await this.getProblemCount();
    // 设置新添加的题目编号
    problemData.number = (count + offset + 1).toString();
    problemData.createTime = Date.now();
    problemData.updateTime = Date.now();
    return await this.problemModel.create(problemData);
  }

  async updateByProblemId(id, obj: ProblemDTO) {
    const problemData = obj as ProblemModel;
    problemData.updateTime = Date.now();
    return this.problemModel.updateOne({ _id: id }, problemData);
  }

  async queryAll() {
    return this.problemModel.find();
  }

  async queryByProblemNum(problemNum: string) {
    const res = await this.problemModel.findOne({
      number: problemNum,
    });
    return res;
  }

  async queryByProblemId(problemId: string) {
    const res = await this.problemModel.findOne({
      _id: problemId,
    });
    return res;
  }

  async getProblemCount() {
    return this.problemModel.estimatedDocumentCount();
  }

  async deleteByProblemId(problemId: string) {
    return this.problemModel.findByIdAndDelete(problemId);
  }
}
