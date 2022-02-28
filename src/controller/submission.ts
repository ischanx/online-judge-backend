import {
  Controller,
  Provide,
  Inject,
  Post,
  ALL,
  Validate,
  Body,
} from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';
import { Context } from 'egg';
import { ProblemService } from '../service/problem';
import { SubmissionsService } from '../service/submissions';
import { getBySubmissionIdDTO, SubmissionDTO } from '../model/submission';

@Provide()
@Controller('/api/submission')
export class SubmissionController {
  @Inject()
  ctx: Context;

  @Inject()
  redisService: RedisService;

  @Inject()
  problemService: ProblemService;

  @Inject()
  submissionService: SubmissionsService;

  @Post('/submit')
  @Validate()
  async submit(@Body(ALL) body: SubmissionDTO) {
    const { lang, code, problemId } = body;
    const response = this.ctx.body;
    const problem = await this.problemService.queryByProblemId(
      String(problemId)
    );
    if (!problem) {
      throw {
        code: 4002,
        message: '题目不存在',
      };
    }
    const obj = {
      problemId,
      code,
      lang,
      problemNumber: problem.number,
      problemTitle: problem.title,
      uid: this.ctx.state.user.uuid,
      username: this.ctx.state.user.name,
      status: 'pending',
    };

    const submitResult = await this.submissionService.submit(obj);
    const submissionId = submitResult._id;
    if (submitResult) {
      response.data = {
        submissionId,
      };
    } else {
      throw {
        code: 4002,
        message: '提交失败',
      };
    }
  }

  @Post('/check')
  @Validate()
  async check(@Body(ALL) body: getBySubmissionIdDTO) {
    const { id } = body;
    const response = this.ctx.body;
    const res = await this.submissionService.getBySubmissionId(id);
    if (res) {
      if (res.status === 'pending') response.data = { status: 'pending' };
      else response.data = res;
    } else {
      throw {
        code: 4002,
        message: '提交记录不存在',
      };
    }
  }
}
