import {
  Controller,
  Provide,
  Inject,
  Post,
  ALL,
  Body,
  Get,
} from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';
import { Context } from 'egg';
import { ProblemService } from '../service/problem';
import { SubmissionsService } from '../service/submissions';
import { JudgeManagerService } from '../service/judgeManager';

@Provide()
@Controller('/api/judge')
export class JudgeManagerController {
  @Inject()
  ctx: Context;

  @Inject()
  redisService: RedisService;

  @Inject()
  problemService: ProblemService;

  @Inject()
  submissionService: SubmissionsService;

  @Inject()
  judgeManagerService: JudgeManagerService;

  @Post('/connect')
  async check(@Body(ALL) body) {
    console.log(body);
    console.log(this.ctx.request);
    this.ctx.body.data = 'success';
  }

  @Post('/add')
  async addJudge(@Body(ALL) body) {
    const { judgeURL } = body;
    const response = this.ctx.body;
    const res = await this.judgeManagerService.addByJudgeURL(judgeURL);
    if (res._id && res.active) {
      response.data = res;
    } else {
      throw {
        code: 5000,
        message: '添加评测机失败，请检查',
      };
    }
  }

  @Post('/ping')
  async pingJudge(@Body(ALL) body) {
    const { judgeURL } = body;
    const response = this.ctx.body;
    const res = await this.judgeManagerService.pingByJudgeURL(judgeURL);
    if (res?.judge_version) {
      response.data = res;
    } else {
      throw {
        code: 5000,
        message: res.message,
      };
    }
  }

  @Post('/remove')
  async removeJudge() {}

  @Get('/list')
  async listJudge() {
    const response = this.ctx.body;
    response.data = await this.judgeManagerService.listAllJudge();
  }
}
