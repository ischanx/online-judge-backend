import { Config, Inject, Provide } from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';
import axios from 'axios';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { JudgeModel } from '../model/judge';

@Provide()
export class JudgeManagerService {
  @InjectEntityModel(JudgeModel)
  judgeModel: ReturnModelType<typeof JudgeModel>;

  @Inject()
  redisService: RedisService;

  @Config('JUDGE_TOKEN')
  JUDGE_TOKEN: string;

  async pingByJudgeURL(judgeURL: string) {
    const res = await axios.get(`${judgeURL}/ping`, {
      headers: {
        'x-judge-server-token': this.JUDGE_TOKEN,
      },
      responseType: 'json',
    });
    return res.data;
  }

  async addByJudgeURL(judgeURL: string) {
    const pingRes = await this.pingByJudgeURL(judgeURL);
    const pingSuccess = !!pingRes.judge_version;
    return this.judgeModel.create({
      active: pingSuccess,
      judgeURL: judgeURL,
      createTime: Date.now(),
      updateTime: Date.now(),
    });
  }

  async listAllJudge() {
    return this.judgeModel.find({});
  }

  async deliverTask(submission) {
    // TODO: 选择一个合适的评测机
    const judgeURL = 'http://chanx.tech:9001';
    const res = await axios.post(`${judgeURL}/judge`, submission, {
      headers: {
        'x-judge-server-token': this.JUDGE_TOKEN,
      },
      responseType: 'json',
    });
    return res.data;
  }
}
