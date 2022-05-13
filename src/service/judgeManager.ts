import { Config, Inject, Provide } from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';
import axios from 'axios';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { JudgeModel } from '../model/judge';

let index = 0;
@Provide()
export class JudgeManagerService {
  @InjectEntityModel(JudgeModel)
  judgeModel: ReturnModelType<typeof JudgeModel>;

  @Inject()
  redisService: RedisService;

  @Config('JUDGE_TOKEN')
  JUDGE_TOKEN: string;

  async pingByJudgeURL(judgeURL: string) {
    try {
      const res = await axios.get(`${judgeURL}/ping`, {
        headers: {
          'x-judge-server-token': this.JUDGE_TOKEN,
        },
        responseType: 'json',
      });
      return res.data;
    } catch (e) {
      return {};
    }
  }

  async addByJudgeURL(judgeURL: string) {
    const pingRes = await this.pingByJudgeURL(judgeURL);
    if (pingRes) {
      const judgeInfo = {
        active: false,
        judgeURL: judgeURL,
        createTime: Date.now(),
        updateTime: Date.now(),
      };
      const saveKeys = [
        'judge_version',
        'hostname',
        'cpu_core',
        'cpu_model',
        'memory_total',
      ];
      saveKeys.forEach(key => (judgeInfo[key] = pingRes[key]));
      return await this.judgeModel.create(judgeInfo);
    } else return {};
  }

  async removeByInlineId(id: string) {
    return this.judgeModel.deleteOne({ _id: id });
  }

  async updateByInlineId(id: string, data: any) {
    await this.redisService.del('judge-list');
    return this.judgeModel.updateOne({ _id: id }, data);
  }

  async getJudgeList(latest = false) {
    const currentList = await this.redisService.get('judge-list');
    if (latest || !currentList) {
      const activeList = await this.judgeModel.find({ active: true });
      const judgeList = [];
      for (let i = 0; i < activeList.length; i++) {
        const pingRes = await this.pingByJudgeURL(activeList[i].judgeURL);
        if (pingRes['judge_version']) {
          judgeList.push({
            judgeURL: activeList[i].judgeURL,
            ...pingRes,
          });
        }
      }
      if (judgeList.length) {
        await this.redisService.set(
          'judge-list',
          JSON.stringify(judgeList),
          'EX',
          5 * 60
        );
      }
      return judgeList;
    } else return JSON.parse(currentList);
  }

  async listAllJudge() {
    return this.judgeModel.find({});
  }

  async deliverTask(submission) {
    const judgeList = await this.getJudgeList();
    if (judgeList.length === 0) {
      console.error('未找到评测端进行评测' + new Date().toLocaleString());
      return;
    }
    if (index >= judgeList.length) index = 0;
    const judgeURL = judgeList[index].judgeURL
      ? judgeList[index].judgeURL
      : judgeList[0].judgeURL;
    index++;
    try {
      const res = await axios.post(`${judgeURL}/judge`, submission, {
        headers: {
          'x-judge-server-token': this.JUDGE_TOKEN,
        },
        responseType: 'json',
      });
      return res.data;
    } catch (e) {
      console.log('deliver task error');
      const currentJudge = judgeList[index - 1].judgeURL;
      const isError = await this.redisService.get(`error-${currentJudge}`);
      if (isError) {
        await this.judgeModel.updateOne(
          {
            judgeURL: currentJudge,
          },
          {
            active: false,
          }
        );
        await this.redisService.del('judge-list');
      } else {
        await this.redisService.set(`error-${currentJudge}`, 1, 'EX', 15);
      }
      throw {
        code: 5000,
        message: '请重试',
      };
    }
  }
}
